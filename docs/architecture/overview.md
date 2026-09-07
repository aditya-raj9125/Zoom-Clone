# System Architecture Overview

## 1. High-Level Monorepo Architecture

The Zoom Clone platform is structured as a clean, lightweight monorepo separating runnable applications from reusable packages and system documentation:

```mermaid
flowchart TB
    subgraph Clients["Clients"]
        Browser["User Browser / Client"]
    end

    subgraph Apps["Applications (apps/)"]
        Web["apps/web<br/>Next.js 16 Web App"]
        API["apps/api<br/>FastAPI Modular Monolith"]
    end

    subgraph Packages["Shared Packages (packages/)"]
        UI["packages/ui<br/>Design System Primitives"]
        Contracts["packages/contracts<br/>API & Realtime DTOs"]
    end

    subgraph Storage["Persistence & Realtime"]
        DB[("SQLite Database<br/>aiosqlite")]
        WSManager["In-Memory ConnectionManager<br/>WebSocket Broadcast & Signaling"]
    end

    Browser -->|HTTP / HTML| Web
    Browser -->|REST API Requests| API
    Browser -->|WebSocket Connection| WSManager

    Web --> UI
    Web --> Contracts

    API --> WSManager
    API --> DB

    Browser <-->|WebRTC Peer Media (P2P)| Browser
```

---

## 2. Directory Responsibilities

| Path | Type | Responsibility |
|---|---|---|
| `apps/web/` | Application | Next.js 16 frontend (Client-side rendering, meeting room, dashboard) |
| `apps/api/` | Application | FastAPI backend (REST endpoints, business logic, state machines, WebSockets) |
| `packages/ui/` | Package | Design-system UI components (Buttons, Modals, Participant Grid, Controls) |
| `packages/contracts/` | Package | Shared TypeScript interfaces and DTOs reflecting FastAPI OpenAPI schemas |
| `docs/` | Documentation | Architecture specifications, API references, ER schemas, ADRs |

---

## 3. Communication & Data Flow

1. **Meeting Creation & State**:
   - Web application issues REST POST to `apps/api`.
   - `apps/api` executes atomic transaction in SQLite and returns meeting metadata (10-digit ID, passcode, invite token).
2. **Real-time Presence & Events**:
   - When a participant joins, an authenticated WebSocket session is established at `/api/v1/ws/meetings/{meeting_id}?participant_id={pid}`.
   - `ConnectionManager` broadcasts participant joins, leaves, mutes, chat messages, and reactions.
3. **WebRTC Media Flow**:
   - Peers exchange SDP offers/answers and ICE candidates over the WebSocket connection.
   - Once signaling completes, direct peer-to-peer media tracks (audio, video, screen share) flow between browsers.
