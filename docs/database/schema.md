# Database Schema

The backend uses SQLAlchemy 2.0 async ORM with `aiosqlite` and Alembic migrations. Local development defaults to `apps/api/data/zoom_clone.db`.

## Entity relationship model

```mermaid
erDiagram
    USERS ||--o{ MEETINGS : hosts
    USERS ||--o{ MEETING_PARTICIPANTS : identifies
    MEETINGS ||--o{ MEETING_PARTICIPANTS : contains
    MEETINGS ||--o{ MEETING_EVENTS : records
    MEETINGS ||--o{ CHAT_MESSAGES : contains
    MEETINGS ||--o{ REACTIONS : receives

    USERS {
        string id PK
        string display_name
        string email
        string avatar_url
        boolean is_default_user
        datetime created_at
        datetime updated_at
    }
    MEETINGS {
        string id PK
        string meeting_id UK
        string invite_token UK
        string title
        string description
        string host_user_id FK
        string passcode
        string status
        string meeting_type
        datetime scheduled_start_at
        datetime scheduled_end_at
        datetime actual_started_at
        datetime actual_ended_at
    }
    MEETING_PARTICIPANTS {
        string id PK
        string meeting_id FK
        string user_id FK
        string participant_id UK
        string display_name
        string role
        boolean is_host
        boolean is_active
        boolean audio_enabled
        boolean video_enabled
        boolean screen_sharing
        boolean hand_raised
        boolean muted_by_host
        boolean removed_from_meeting
        datetime joined_at
        datetime left_at
    }
    MEETING_EVENTS {
        string id PK
        string meeting_id FK
        string participant_id
        string event_type
        string metadata_json
        datetime created_at
    }
    CHAT_MESSAGES {
        string id PK
        string meeting_id FK
        string participant_id
        string display_name
        string message
        datetime created_at
        datetime deleted_at
    }
    REACTIONS {
        string id PK
        string meeting_id FK
        string participant_id
        string display_name
        string reaction_type
        datetime created_at
    }
```

## Table responsibilities

| Table | Responsibility |
| --- | --- |
| `users` | Local user identity and profile data |
| `meetings` | Public meeting identity, lifecycle, schedule and host ownership |
| `meeting_participants` | Per-session presence, role, device state and moderation flags |
| `meeting_events` | Audit trail for lifecycle and participant actions |
| `chat_messages` | Durable in-meeting chat history |
| `reactions` | Durable reaction records used for realtime reaction events |

## Conventions

- Database primary keys are UUID strings (`VARCHAR(36)`), while public meeting and participant IDs are opaque generated strings.
- Foreign keys are enabled on SQLite connections.
- Async relationships use `selectin` loading to avoid implicit synchronous IO.
- Lifecycle flags are explicit: a participant can be inactive or removed without deleting the historical row.
- All timestamps are stored and returned in UTC.

## Indexing strategy

Important lookups are indexed on:

- `meetings.meeting_id`
- `meetings.invite_token`
- `meetings.host_user_id`
- `meetings.status`
- `meeting_participants.participant_id`
- `meeting_participants.meeting_id`
- `meeting_participants.is_active`

## Migration workflow

```bash
cd apps/api
export PYTHONPATH=.
python -m alembic upgrade head
python -m alembic current
```

Create a new migration after changing SQLAlchemy models:

```bash
python -m alembic revision --autogenerate -m "describe schema change"
python -m alembic upgrade head
```
