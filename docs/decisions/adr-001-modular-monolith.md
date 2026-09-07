# ADR 001: Modular Monolith Architecture & WebRTC Mesh Signaling

## Status
Accepted

## Context
The project is a Zoom Clone built for evaluation by Google engineers. It requires a clean separation of concerns, robust meeting state coordination, real-time collaboration (presence, chat, reactions), and audio/video WebRTC media streams.

We evaluated two architectural approaches:
1. Microservices / Distributed Architecture (Kubernetes, Kafka, Redis, separate auth/meeting/chat services, external SFU like LiveKit or Mediasoup).
2. Modular Monolith with layered domain boundaries (FastAPI, SQLite async, WebSocket signaling bus, peer-to-peer WebRTC mesh with clean SFU abstraction boundary).

## Decision
We chose the **Modular Monolith** architecture:
- **FastAPI Core**: Encapsulates feature domains (`users`, `meetings`, `participants`, `chat`, `reactions`, `realtime`) behind dedicated services and repositories. Routes contain zero business logic.
- **SQLite with aiosqlite**: Delivers zero-infrastructure local setup while retaining full SQL relational modeling and ACID guarantees.
- **WebSocket Signaling**: Relays standard SDP offers, answers, and ICE candidates without coupling application logic to media transport.
- **Monorepo Layout**: Segregates `apps/` (runnable web & api) from `packages/` (reusable UI and contracts), establishing a contract-first interface between Next.js and FastAPI.

## Consequences
### Positive
- **Simplicity & Zero-Friction Setup**: No Docker, Redis, or external C++ media server installation required to run the test suite or local dev.
- **Zero Business Logic Coupling**: Meeting services only manage lifecycle and authorization; they are unaware of whether media is P2P or SFU.
- **Extensible to SFU**: If scaling beyond 4+ participants is required in Phase 2, an SFU (e.g. LiveKit or Mediasoup) can be plugged directly into the WebSocket signaling layer without modifying any database schemas or REST endpoints.

### Negative / Trade-offs
- Pure P2P mesh WebRTC scales uplink bandwidth at $O(N)$, which is optimal for 2–4 participants but requires an SFU for larger groups.
