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

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private onRemoteTrackCallback?: (participantId: string, track: MediaStreamTrack, stream: MediaStream) => void;
  private onRemoteLeaveCallback?: (participantId: string) => void;

  constructor(
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
      this.localStream = acquiredStream;
      // Also add newly acquired tracks to all existing peer connections
      this.peers.forEach((peer) => {
        acquiredStream!.getTracks().forEach((track) => {
          const senders = peer.getSenders();
          const existingSender = senders.find((s) => s.track?.kind === track.kind);
          if (existingSender) {
            existingSender.replaceTrack(track);
          } else {
            peer.addTrack(track, acquiredStream!);
          }
        });
      });
      return acquiredStream;
    }

    // Fallback: Generate a synthetic canvas video track + silent audio track
    this.localStream = this.createSyntheticStream(video, audio);
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

  getRemoteStream(participantId: string): MediaStream | null {
    return this.remoteStreams.get(participantId) || null;
  }

  /**
   * Handle incoming WebRTC signaling messages from WebSocket
   */
  async handleSignalingEvent(event: string, payload: Record<string, unknown>): Promise<void> {
    const senderId = (payload.from_participant_id || payload.sender_participant_id) as string;
    if (!senderId) return;

    if (event === "webrtc.offer") {
      let peer = this.peers.get(senderId);
      if (!peer) {
        peer = this.createPeerConnection(senderId);
      }
      await peer.setRemoteDescription(new RTCSessionDescription({
        type: "offer",
        sdp: payload.sdp as string,
      }));
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
        await peer.setRemoteDescription(new RTCSessionDescription({
          type: "answer",
          sdp: payload.sdp as string,
        }));
      }
    } else if (event === "webrtc.ice_candidate") {
      const peer = this.peers.get(senderId);
      if (peer && payload.candidate) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(payload.candidate as RTCIceCandidateInit));
        } catch (err) {
          console.warn("Error adding ICE candidate:", err);
        }
      }
    } else if (event === "participant.left" || event === "participant.removed") {
      this.closePeer(senderId);
      this.remoteStreams.delete(senderId);
      this.onRemoteLeaveCallback?.(senderId);
    }
  }

  /**
   * Initiate call to a newly joined participant
   */
  async callParticipant(targetParticipantId: string): Promise<void> {
    const peer = this.createPeerConnection(targetParticipantId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    // Send offer with InboundMessage format
    this.sendSignalingMessage("webrtc.offer", {
      target_participant_id: targetParticipantId,
      payload: {
        sdp: offer.sdp,
        type: "offer",
      },
    });
  }

  private createPeerConnection(participantId: string): RTCPeerConnection {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peer.addTrack(track, this.localStream!);
      });
    }

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        this.sendSignalingMessage("webrtc.ice_candidate", {
          target_participant_id: participantId,
          payload: {
            candidate: e.candidate.toJSON(),
          },
        });
      }
    };

    peer.ontrack = (e) => {
      let stream = this.remoteStreams.get(participantId);
      if (!stream) {
        stream = new MediaStream();
        this.remoteStreams.set(participantId, stream);
      }
      stream.addTrack(e.track);

      if (this.onRemoteTrackCallback) {
        this.onRemoteTrackCallback(participantId, e.track, stream);
      }
    };

    this.peers.set(participantId, peer);
    return peer;
  }

  private closePeer(participantId: string): void {
    const peer = this.peers.get(participantId);
    if (peer) {
      peer.close();
      this.peers.delete(participantId);
    }
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
  }
}
