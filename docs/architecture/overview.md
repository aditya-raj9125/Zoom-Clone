# Architecture Overview

> **Design goal** · keep the meeting workflow simple to run locally, explicit at each boundary, and ready to evolve beyond a single-process prototype.

## System context

```mermaid
flowchart TB
    User["Meeting participant"]
    Browser["Browser<br/>Next.js + WebRTC"]
    API["FastAPI application"]
    DB[("SQLite database")]
    Realtime["WebSocket ConnectionManager"]
    Peer["Other participants<br/>peer-to-peer media"]

    User --> Browser
    Browser -->|REST: lifecycle + state| API
    Browser -->|WebSocket: presence + signaling| Realtime
    API --> DB
    API --> Realtime
    Browser <-->|Audio, video, screen tracks| Peer
```

## Module ownership

| Module | Owns | Does not own |
| --- | --- | --- |
| `apps/web` | Routes, meeting UI, browser permissions, `RTCPeerConnection` lifecycle | Database rules or meeting authorization |
| `apps/api/app/features/meetings` | Meeting creation, scheduling and lifecycle transitions | Browser media transport |
| `apps/api/app/features/participants` | Join/leave, media flags and host moderation | SDP parsing or media forwarding |
| `apps/api/app/features/realtime` | WebSocket authentication, event broadcast and signaling relay | Business persistence |
| `apps/api/app/features/chat` | Chat persistence and broadcast | WebRTC state |
| `apps/api/app/features/reactions` | Reaction persistence and broadcast | Meeting lifecycle |
| `packages/contracts` | Shared TypeScript DTOs and event names | Runtime validation on the server |
| `packages/ui` | Reusable visual primitives and class utilities | Application state |

## Request and event paths

```mermaid
flowchart LR
    UI["Next.js UI"] --> Client["apps/web/src/lib/api.ts"]
    Client --> HTTP["HTTP /api/v1"]
    HTTP --> Router["FastAPI router"]
    Router --> Service["Feature service"]
    Service --> Repo["Repository"]
    Repo --> DB[("SQLite")]
    Service --> Broadcast["ConnectionManager.broadcast"]
    Broadcast --> Sockets["Connected meeting sockets"]
```

## Meeting lifecycle

```mermaid
stateDiagram-v2
    [*] --> LIVE: instant meeting
    [*] --> SCHEDULED: scheduled meeting
    SCHEDULED --> LIVE: host starts
    SCHEDULED --> CANCELLED: cancellation
    LIVE --> ENDED: host ends
    LIVE --> LIVE: participants join / leave
    ENDED --> [*]
    CANCELLED --> [*]
```

## WebRTC design

The server is a signaling relay, not a media server. Each browser creates one `RTCPeerConnection` per remote participant. The current implementation uses:

1. A deterministic initiator per participant pair to avoid offer collisions.
2. Server-side buffering when a participant has completed REST join but has not registered its socket yet.
3. Per-peer client signaling queues so SDP and ICE operations are processed in order.
4. ICE candidate queues until the remote description exists.
5. React state updates when `ontrack` fires so tiles render the latest `MediaStream` without reloads.

```mermaid
sequenceDiagram
    participant A as Initiating browser
    participant S as WebSocket relay
    participant B as Receiving browser

    A->>A: create RTCPeerConnection
    A->>A: attach audio/video transceivers
    A->>S: offer + target participant ID
    S-->>B: offer + sender participant ID
    B->>B: setRemoteDescription(offer)
    B->>S: answer
    S-->>A: answer
    A-->>S: ICE candidates
    S-->>B: ICE candidates
    B-->>A: ICE candidates
    A<<->>B: ontrack -> MediaStream -> tile
```

## Scaling path

```mermaid
flowchart LR
    Mesh["Current: WebRTC mesh<br/>small rooms"] --> Shared["Shared realtime bus<br/>Redis / pub-sub"]
    Shared --> SFU["Future: SFU<br/>LiveKit / mediasoup"]
    SFU --> Scale["Larger meetings<br/>centralized media routing"]
```

The REST contracts and domain services are deliberately independent of the media transport so an SFU can replace the mesh without redesigning persistence.

## Non-functional notes

- All API timestamps are UTC.
- Public meeting and participant identifiers are opaque; internal database IDs are not exposed by the client API.
- SQLite is selected for zero-infrastructure local development. Use managed Postgres for durable multi-instance production.
- The in-memory `ConnectionManager` is process-local. Shared state is required before running multiple API instances.
