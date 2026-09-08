# WebSocket and WebRTC Protocol

Endpoint:

```text
ws://localhost:8000/api/v1/ws/meetings/{meeting_id}?participant_id={participant_id}
```

Use `wss://` behind HTTPS.

## Connection lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant API as FastAPI WebSocket
    participant Registry as ConnectionManager
    participant Room as Other clients

    Client->>API: Connect with meeting_id + participant_id
    API->>API: Validate active membership
    API->>Registry: Register socket
    Registry-->>Client: Flush buffered signaling, if any
    Registry-->>Room: participant.joined
    Client->>API: Realtime messages
    Client-->>API: Socket close
    API->>Registry: Remove socket
    Registry-->>Room: participant.left
```

The join event is emitted after the socket is registered. This makes a new participant reachable for signaling before another client starts negotiation.

## Event envelope

All server events use:

```json
{
  "type": "participant.joined",
  "meeting_id": "8461249264",
  "timestamp": "2026-09-08T10:30:00+00:00",
  "payload": {}
}
```

Client signaling messages add `target_participant_id` at the top level:

```json
{
  "type": "webrtc.offer",
  "target_participant_id": "target-participant-id",
  "payload": {
    "sdp": "v=0...",
    "type": "offer"
  }
}
```

The server injects `from_participant_id` into forwarded signaling payloads.

## Event catalog

| Event | Direction | Meaning |
| --- | --- | --- |
| `meeting.started` / `meeting.ended` | Server → clients | Meeting lifecycle changed |
| `participant.joined` / `participant.left` | Server → clients | Presence changed |
| `participant.removed` | Server → clients | Host removed a participant |
| `participant.audio_changed` | Server → clients | Microphone state changed |
| `participant.video_changed` | Server → clients | Camera state changed |
| `participant.muted` / `participant.unmuted` | Server → clients | Host moderation state |
| `screen_share.started` / `.stopped` | Server → clients | Screen sharing changed |
| `chat.message_created` | Server → clients | New persisted chat message |
| `reaction.created` | Server → clients | New reaction |
| `host.mute_all` | Server → clients | Host muted all non-host participants |
| `webrtc.offer` | Client ↔ server relay | SDP offer |
| `webrtc.answer` | Client ↔ server relay | SDP answer |
| `webrtc.ice_candidate` | Client ↔ server relay | ICE candidate |
| `ping` / `pong` | Client ↔ server | Connectivity check |

## WebRTC negotiation

```mermaid
sequenceDiagram
    autonumber
    participant Initiator
    participant Relay as WebSocket relay
    participant Receiver

    Initiator->>Initiator: Create peer connection
    Initiator->>Relay: webrtc.offer
    Relay-->>Receiver: webrtc.offer + from_participant_id
    Receiver->>Receiver: Create peer connection
    Receiver->>Receiver: setRemoteDescription(offer)
    Receiver->>Relay: webrtc.answer
    Relay-->>Initiator: webrtc.answer
    Initiator->>Initiator: setRemoteDescription(answer)
    Initiator-->>Relay: webrtc.ice_candidate*
    Relay-->>Receiver: webrtc.ice_candidate*
    Receiver-->>Relay: webrtc.ice_candidate*
    Relay-->>Initiator: webrtc.ice_candidate*
    Initiator<<->>Receiver: ICE connectivity checks
    Receiver-->>Receiver: ontrack(MediaStreamTrack)
```

### Reliability rules

- Exactly one client initiates a pair using a deterministic participant-ID ordering.
- The server buffers targeted signaling events if the target socket is not registered yet.
- The client queues ICE candidates until the matching remote description exists.
- Signaling operations are serialized per remote participant to prevent offer/answer races.
- Leaving or removal closes the peer connection, removes the remote stream and clears queued candidates.
- Camera/microphone state is a durable REST mutation plus a realtime state event; media itself stays on the WebRTC connection.

## Close codes and errors

| Code | Meaning |
| --- | --- |
| `4001` | Participant not found or inactive |
| `4003` | Participant does not belong to the meeting |
| `4004` | Meeting not found |

Invalid client messages receive an `error` event with a machine-readable `payload.code` and human-readable `payload.message`.
