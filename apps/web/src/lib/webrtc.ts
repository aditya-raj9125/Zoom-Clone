/**
 * WebRTC and Media Stream manager for Zoom Clone.
 * Handles local camera/microphone acquisition, virtual fallback for headless/camera-less environments,
 * screen sharing, and peer signaling.
 */

export interface LocalMediaState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  stream: MediaStream | null;
  screenStream: MediaStream | null;
}

const METERED_CREDENTIALS_API =
  "https://doudizhu-online.metered.live/api/v1/turn/credentials?apiKey=69960ccff638874fa5ab1dcb405d13b1097f";

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  // Google Public STUN
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  // Cloudflare Public STUN
  { urls: "stun:stun.cloudflare.com:3478" },
  // Metered STUN
  { urls: "stun:stun.relay.metered.ca:80" },
  // Metered Global TURN Relays (Verified & Authenticated: UDP + TCP + TLS over 80 and 443)
  {
    urls: [
      "turn:global.relay.metered.ca:80",
      "turn:global.relay.metered.ca:80?transport=tcp",
      "turn:global.relay.metered.ca:443",
      "turn:global.relay.metered.ca:443?transport=tcp",
      "turns:global.relay.metered.ca:443?transport=tcp",
    ],
    username: "9264d51bf7b61ba6f3c250bd",
    credential: "wNe5ZCN1gAGNqtmK",
  },
];

let activeIceServers: RTCIceServer[] = DEFAULT_ICE_SERVERS;

// Pre-fetch fresh dynamic TURN credentials on load
if (typeof fetch !== "undefined") {
  fetch(METERED_CREDENTIALS_API)
    .then((res) => res.json())
    .then((servers) => {
      if (Array.isArray(servers) && servers.length > 0) {
        activeIceServers = [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          ...servers,
        ];
        console.log("[WebRTC] Dynamic TURN servers loaded from Metered.");
      }
    })
    .catch(() => {
      // Fallback to verified default ICE servers
    });
}

/**
 * Reads the deploy-time ICE configuration. A TURN relay is required for
 * reliable media on mobile, corporate, CGNAT, and symmetric-NAT networks.
 */
function getIceServers(): RTCIceServer[] {
  const raw = process.env.NEXT_PUBLIC_WEBRTC_ICE_SERVERS;
  if (!raw) return activeIceServers;

  try {
    const configured: unknown = JSON.parse(raw);
    if (!Array.isArray(configured)) return activeIceServers;
    const valid = configured.filter((server): server is RTCIceServer => {
      if (!server || typeof server !== "object" || !("urls" in server)) return false;
      const urls = (server as { urls?: unknown }).urls;
      return typeof urls === "string" || (Array.isArray(urls) && urls.every((url) => typeof url === "string"));
    });
    return valid.length > 0 ? valid : activeIceServers;
  } catch {
    console.warn("Invalid NEXT_PUBLIC_WEBRTC_ICE_SERVERS; using active fallback.");
    return activeIceServers;
  }
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private onRemoteTrackCallback?: (participantId: string, track: MediaStreamTrack, stream: MediaStream) => void;
  private onRemoteLeaveCallback?: (participantId: string) => void;

  constructor(
    private localParticipantId: string,
    private sendSignalingMessage: (event: string, data: unknown) => void,
    onRemoteTrack?: (participantId: string, track: MediaStreamTrack, stream: MediaStream) => void,
    onRemoteLeave?: (participantId: string) => void
  ) {
    this.onRemoteTrackCallback = onRemoteTrack;
    this.onRemoteLeaveCallback = onRemoteLeave;
  }

  private animationIntervals: number[] = [];

  /**
   * Acquire user media with graceful fallback.
   * If navigator.mediaDevices is unavailable or user denies, generates a virtual media stream
   * so the application never crashes in test/restricted environments.
   */
  async acquireLocalStream(audio = true, video = true): Promise<MediaStream> {
    if (!audio && !video) {
      this.localStream = new MediaStream();
      return this.localStream;
    }

    let acquiredStream: MediaStream | null = null;

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const constraints: MediaStreamConstraints = {};
        if (audio) constraints.audio = true;
        if (video) {
          constraints.video = {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { max: 30 },
          };
        }
        acquiredStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (combinedErr) {
        console.warn("Combined getUserMedia failed, attempting separate track acquisition:", combinedErr);

        const fallbackStream = new MediaStream();

        if (video) {
          try {
            const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
            vStream.getVideoTracks().forEach((t) => fallbackStream.addTrack(t));
          } catch (vErr) {
            console.warn("Camera acquisition failed:", vErr);
          }
        }

        if (audio) {
          try {
            const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            aStream.getAudioTracks().forEach((t) => fallbackStream.addTrack(t));
          } catch (aErr) {
            console.warn("Microphone acquisition failed:", aErr);
          }
        }

        if (fallbackStream.getTracks().length > 0) {
          acquiredStream = fallbackStream;
        }
      }
    }

    if (acquiredStream) {
      const previousStream = this.localStream;
      this.localStream = acquiredStream;
      if (previousStream && previousStream !== acquiredStream) {
        previousStream.getTracks().forEach((track) => track.stop());
      }

      // Seamlessly update sender tracks across all active peer connections
      await Promise.all(
        Array.from(this.peers.values()).map((peer) =>
          this.attachLocalTracks(peer, acquiredStream!)
        )
      );
      return acquiredStream;
    }

    // Fallback: Generate a synthetic canvas video track + silent audio track
    const previousStream = this.localStream;
    this.localStream = this.createSyntheticStream(video, audio);
    if (previousStream && previousStream !== this.localStream) {
      previousStream.getTracks().forEach((track) => track.stop());
    }
    await Promise.all(
      Array.from(this.peers.values()).map((peer) =>
        this.attachLocalTracks(peer, this.localStream)
      )
    );
    return this.localStream;
  }

  /**
   * Create synthetic video and audio stream for fallback/headless testing with live animation.
   */
  private createSyntheticStream(withVideo: boolean, withAudio: boolean): MediaStream {
    const stream = new MediaStream();

    if (withVideo && typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        let pulse = 0;
        const renderFrame = () => {
          ctx.fillStyle = "#0F172A";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Animated pulsing camera beacon
          pulse = (pulse + 0.05) % (Math.PI * 2);
          const radius = 45 + Math.sin(pulse) * 5;

          ctx.beginPath();
          ctx.arc(320, 150, radius, 0, Math.PI * 2);
          ctx.fillStyle = "#0B5CFF";
          ctx.fill();
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = 4;
          ctx.stroke();

          // Camera Icon inside circle
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(302, 137, 36, 26, 4) : ctx.rect(302, 137, 36, 26);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(338, 143);
          ctx.lineTo(348, 137);
          ctx.lineTo(348, 163);
          ctx.lineTo(338, 157);
          ctx.closePath();
          ctx.fill();

          // Live Text
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 20px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Zoom Camera Active", 320, 235);

          ctx.fillStyle = "#94A3B8";
          ctx.font = "13px sans-serif";
          ctx.fillText(new Date().toLocaleTimeString(), 320, 265);
        };

        renderFrame();
        const intervalId = window.setInterval(renderFrame, 150);
        this.animationIntervals.push(intervalId);
      }

      const canvasStream = canvas.captureStream(20);
      const videoTrack = canvasStream.getVideoTracks()[0];
      if (videoTrack) {
        stream.addTrack(videoTrack);
      }
    }

    if (withAudio && typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const osc = audioCtx.createOscillator();
          const dst = audioCtx.createMediaStreamDestination();
          osc.connect(dst);
          osc.start();
          const audioTrack = dst.stream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.enabled = false; // silent by default
            stream.addTrack(audioTrack);
          }
        }
      } catch {
        // audio context fallback
      }
    }

    return stream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getScreenStream(): MediaStream | null {
    return this.screenStream;
  }

  setAudioEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  setVideoEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  async startScreenShare(): Promise<MediaStream | null> {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getDisplayMedia) {
      try {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Add track to all existing peer connections
        const screenTrack = this.screenStream.getVideoTracks()[0];
        if (screenTrack) {
          this.peers.forEach((peer) => {
            const senders = peer.getSenders();
            const videoSender = senders.find((s) => s.track?.kind === "video");
            if (videoSender) {
              videoSender.replaceTrack(screenTrack);
            } else {
              peer.addTrack(screenTrack, this.screenStream!);
            }
          });

          screenTrack.onended = () => {
            this.stopScreenShare();
          };
        }

        return this.screenStream;
      } catch (err) {
        console.warn("Screen share cancelled or failed:", err);
      }
    }
    return null;
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;

      // Revert video track to local camera
      if (this.localStream) {
        const camTrack = this.localStream.getVideoTracks()[0];
        if (camTrack) {
          this.peers.forEach((peer) => {
            const videoSender = peer.getSenders().find((s) => s.track?.kind === "video");
            if (videoSender) {
              videoSender.replaceTrack(camTrack);
            }
          });
        }
      }
    }
  }

  private remoteStreams: Map<string, MediaStream> = new Map();
  private iceCandidatesQueue: Map<string, RTCIceCandidateInit[]> = new Map();
  private iceRestartAttempts: Map<string, number> = new Map();
  // WebSocket message handlers may run concurrently while SDP operations are
  // still pending. Serialize signaling operations per peer.
  private signalingQueues: Map<string, Promise<void>> = new Map();

  getRemoteStream(participantId: string): MediaStream | null {
    return this.remoteStreams.get(participantId) || null;
  }

  hasPeer(participantId: string): boolean {
    const peer = this.peers.get(participantId);
    return Boolean(peer && peer.connectionState !== "closed" && peer.connectionState !== "failed");
  }

  /**
   * Handle incoming WebRTC signaling messages from WebSocket
   */
  async handleSignalingEvent(event: string, payload: Record<string, unknown>): Promise<void> {
    const senderId = (
      payload.from_participant_id ||
      payload.sender_participant_id ||
      payload.participant_id
    ) as string;
    if (!senderId) return;

    const previous = this.signalingQueues.get(senderId) || Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(() => this.processSignalingEvent(event, payload, senderId));
    this.signalingQueues.set(senderId, current);

    try {
      await current;
    } finally {
      if (this.signalingQueues.get(senderId) === current) {
        this.signalingQueues.delete(senderId);
      }
    }
  }

  private async processSignalingEvent(
    event: string,
    payload: Record<string, unknown>,
    senderId: string
  ): Promise<void> {
    if (event === "participant.left" || event === "participant.removed") {
      this.closePeer(senderId);
      this.onRemoteLeaveCallback?.(senderId);
      return;
    }

    if (event === "webrtc.offer") {
      let peer = this.peers.get(senderId);
      if (
        !peer ||
        peer.signalingState === "closed" ||
        peer.connectionState === "failed"
      ) {
        peer = this.createPeerConnection(senderId);
      } else if (peer.signalingState === "have-local-offer") {
        // Defensive glare handling: rollback if offer collision occurs
        try {
          await peer.setLocalDescription({ type: "rollback" });
        } catch {
          // ignore rollback failure
        }
      }

      // Ensure local media tracks are attached before setting remote description / answering
      await this.attachLocalTracks(peer, this.localStream);

      await peer.setRemoteDescription(new RTCSessionDescription({
        type: "offer",
        sdp: payload.sdp as string,
      }));

      // Drain any ICE candidates received before remote description was ready
      await this.drainQueuedCandidates(senderId, peer);

      // Check transceivers immediately to register any newly associated incoming tracks
      this.scanTransceiversForRemoteTracks(senderId, peer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      // Send answer with InboundMessage format: { type, target_participant_id, payload }
      this.sendSignalingMessage("webrtc.answer", {
        target_participant_id: senderId,
        payload: {
          sdp: answer.sdp,
          type: "answer",
        },
      });
    } else if (event === "webrtc.answer") {
      const peer = this.peers.get(senderId);
      if (peer) {
        if (peer.signalingState === "have-local-offer") {
          await peer.setRemoteDescription(new RTCSessionDescription({
            type: "answer",
            sdp: payload.sdp as string,
          }));
          // Drain any ICE candidates received before answer was applied
          await this.drainQueuedCandidates(senderId, peer);

          // Check transceivers immediately to register incoming tracks
          this.scanTransceiversForRemoteTracks(senderId, peer);
        }
      }
    } else if (event === "webrtc.ice_candidate") {
      const peer = this.peers.get(senderId);
      const candidateInit = payload.candidate as RTCIceCandidateInit;
      if (candidateInit && candidateInit.candidate) {
        if (peer && peer.remoteDescription && peer.remoteDescription.type) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidateInit));
          } catch (err) {
            console.warn("Error adding ICE candidate:", err);
          }
        } else {
          // Remote description not yet set — queue candidate for later
          const q = this.iceCandidatesQueue.get(senderId) || [];
          q.push(candidateInit);
          this.iceCandidatesQueue.set(senderId, q);
        }
      }
    }
  }

  private async drainQueuedCandidates(senderId: string, peer: RTCPeerConnection): Promise<void> {
    const queued = this.iceCandidatesQueue.get(senderId) || [];
    this.iceCandidatesQueue.delete(senderId);
    for (const cand of queued) {
      if (!cand || !cand.candidate) continue;
      try {
        await peer.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.warn("Error adding queued ICE candidate:", err);
      }
    }
  }

  /**
   * Scans all transceivers to ensure any receiver track that is live is registered
   * in remoteStreams even if the browser suppressed the track event.
   */
  private scanTransceiversForRemoteTracks(participantId: string, peer: RTCPeerConnection): void {
    try {
      peer.getTransceivers().forEach((transceiver) => {
        const track = transceiver.receiver?.track;
        if (track && track.readyState === "live") {
          this.registerRemoteTrack(participantId, track);
        }
      });
    } catch {
      // transceivers scan fallback
    }
  }

  /**
   * Registers an incoming remote track, updates remoteStreams with a fresh MediaStream instance,
   * listens for track unmute, and notifies React components.
   */
  private registerRemoteTrack(
    participantId: string,
    track: MediaStreamTrack,
    incomingStream?: MediaStream
  ): void {
    console.log(
      `[WebRTC] registerRemoteTrack from ${participantId}: kind=${track.kind}, id=${track.id}, readyState=${track.readyState}, muted=${track.muted}`
    );

    let stream = this.remoteStreams.get(participantId);
    if (!stream) {
      stream = incomingStream ? new MediaStream(incomingStream.getTracks()) : new MediaStream();
    }

    const currentTrackOfKind = stream.getTracks().find((t) => t.kind === track.kind);
    if (currentTrackOfKind && currentTrackOfKind.id === track.id) {
      // Track is already registered and present. Do not emit duplicate stream references.
      return;
    }

    if (currentTrackOfKind && currentTrackOfKind.id !== track.id) {
      stream.removeTrack(currentTrackOfKind);
    }
    if (!stream.getTracks().some((t) => t.id === track.id)) {
      stream.addTrack(track);
    }

    // Always create a new MediaStream reference so React state detection triggers re-render
    const refreshedStream = new MediaStream(stream.getTracks());
    this.remoteStreams.set(participantId, refreshedStream);

    // When network packets start arriving, track unmutes — trigger callback again
    track.onunmute = () => {
      console.log(`[WebRTC] track onunmute from ${participantId}: kind=${track.kind}`);
      const cur = this.remoteStreams.get(participantId) || refreshedStream;
      this.onRemoteTrackCallback?.(participantId, track, new MediaStream(cur.getTracks()));
    };

    if (this.onRemoteTrackCallback) {
      this.onRemoteTrackCallback(participantId, track, refreshedStream);
    }
  }

  /**
   * Initiate call to a newly joined participant
   */
  async callParticipant(targetParticipantId: string): Promise<void> {
    if (this.hasPeer(targetParticipantId)) return;

    const peer = this.createPeerConnection(targetParticipantId);
    await this.attachLocalTracks(peer, this.localStream);
    await this.createAndSendOffer(peer, targetParticipantId);
  }

  private async createAndSendOffer(
    peer: RTCPeerConnection,
    targetParticipantId: string,
    iceRestart = false
  ): Promise<void> {
    if (peer.signalingState !== "stable") return;
    if (iceRestart) {
      try {
        peer.restartIce();
      } catch {
        // restartIce fallback
      }
    }
    const offer = await peer.createOffer(iceRestart ? { iceRestart: true } : undefined);
    await peer.setLocalDescription(offer);

    this.sendSignalingMessage("webrtc.offer", {
      target_participant_id: targetParticipantId,
      payload: {
        sdp: peer.localDescription?.sdp,
        type: peer.localDescription?.type || "offer",
      },
    });
  }

  private attemptIceRecovery(participantId: string, peer: RTCPeerConnection): void {
    if (this.localParticipantId.localeCompare(participantId) >= 0) return;

    const attempts = this.iceRestartAttempts.get(participantId) || 0;
    if (attempts >= 3) {
      console.error(`[WebRTC] Connection failed permanently after 3 attempts for ${participantId}.`);
      return;
    }
    this.iceRestartAttempts.set(participantId, attempts + 1);
    console.warn(`[WebRTC] Initiating ICE recovery attempt ${attempts + 1}/3 for ${participantId}...`);
    setTimeout(() => {
      if (
        peer.connectionState === "connected" ||
        peer.iceConnectionState === "connected" ||
        peer.iceConnectionState === "completed"
      ) {
        return;
      }
      void this.createAndSendOffer(peer, participantId, true).catch((error) => {
        console.warn(`[WebRTC] ICE recovery offer failed for ${participantId}:`, error);
      });
    }, 2500);
  }

  private createPeerConnection(participantId: string): RTCPeerConnection {
    // If an existing peer connection is present, close it first
    const existing = this.peers.get(participantId);
    if (existing) {
      existing.close();
    }

    const peer = new RTCPeerConnection({
      iceServers: getIceServers(),
      iceCandidatePoolSize: 0,
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });

    peer.onicecandidate = (e) => {
      if (e.candidate && e.candidate.candidate) {
        this.sendSignalingMessage("webrtc.ice_candidate", {
          target_participant_id: participantId,
          payload: {
            candidate: e.candidate.toJSON(),
          },
        });
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${participantId} iceConnectionState=${peer.iceConnectionState}`);
      if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
        this.iceRestartAttempts.delete(participantId);
        this.scanTransceiversForRemoteTracks(participantId, peer);
      } else if (peer.iceConnectionState === "failed" || peer.iceConnectionState === "disconnected") {
        this.attemptIceRecovery(participantId, peer);
      }
    };

    peer.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${participantId} connectionState=${peer.connectionState}`);
      if (peer.connectionState === "connected") {
        this.iceRestartAttempts.delete(participantId);
        this.scanTransceiversForRemoteTracks(participantId, peer);
        return;
      }
      if (peer.connectionState === "failed") {
        this.attemptIceRecovery(participantId, peer);
      }
    };

    peer.ontrack = (e) => {
      console.log(
        `[WebRTC] ontrack from ${participantId}: kind=${e.track.kind}, id=${e.track.id}, readyState=${e.track.readyState}`
      );
      const stream = e.streams && e.streams[0] ? e.streams[0] : undefined;
      this.registerRemoteTrack(participantId, e.track, stream);
    };

    this.peers.set(participantId, peer);
    return peer;
  }

  private async attachLocalTracks(
    peer: RTCPeerConnection,
    stream: MediaStream | null
  ): Promise<void> {
    if (!stream) return;

    const currentSenders = peer.getSenders();
    for (const track of stream.getTracks()) {
      const existingSender = currentSenders.find(
        (s) => s.track && s.track.kind === track.kind
      );
      if (existingSender) {
        if (existingSender.track !== track) {
          try {
            await existingSender.replaceTrack(track);
          } catch (err) {
            console.warn(`[WebRTC] replaceTrack error for ${track.kind}:`, err);
          }
        }
      } else {
        try {
          peer.addTrack(track, stream);
        } catch (err) {
          console.warn(`[WebRTC] addTrack error for ${track.kind}:`, err);
        }
      }
    }
  }

  removeParticipant(participantId: string): void {
    this.closePeer(participantId);
  }

  private closePeer(participantId: string): void {
    const peer = this.peers.get(participantId);
    if (peer) {
      peer.close();
      this.peers.delete(participantId);
    }
    this.remoteStreams.delete(participantId);
    this.iceCandidatesQueue.delete(participantId);
    this.iceRestartAttempts.delete(participantId);
  }

  destroy(): void {
    this.animationIntervals.forEach((id) => clearInterval(id));
    this.animationIntervals = [];
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    this.peers.forEach((peer) => peer.close());
    this.peers.clear();
    this.remoteStreams.clear();
    this.iceCandidatesQueue.clear();
    this.iceRestartAttempts.clear();
    this.signalingQueues.clear();
  }
}
