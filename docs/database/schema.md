# Database Architecture & Schema Specification

The database is powered by asynchronous SQLite (`sqlite+aiosqlite`) using modern SQLAlchemy 2.0 ORM patterns and Alembic migrations.

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o{ meetings : hosts
    users ||--o{ meeting_participants : joins
    meetings ||--o{ meeting_participants : contains
    meetings ||--o{ meeting_events : tracks
    meetings ||--o{ chat_messages : stores
    meetings ||--o{ reactions : receives

    users {
        VARCHAR_36 id PK
        VARCHAR_100 display_name
        VARCHAR_255 email UK
        VARCHAR_500 avatar_url
        BOOLEAN is_default_user
        DATETIME created_at
        DATETIME updated_at
    }

    meetings {
        VARCHAR_36 id PK
        VARCHAR_10 meeting_id UK
        VARCHAR_64 invite_token UK
        VARCHAR_200 title
        TEXT description
        VARCHAR_36 host_user_id FK
        VARCHAR_20 passcode
        VARCHAR_20 status
        VARCHAR_20 meeting_type
        DATETIME scheduled_start_at
        DATETIME scheduled_end_at
        DATETIME actual_started_at
        DATETIME actual_ended_at
        DATETIME created_at
        DATETIME updated_at
    }

    meeting_participants {
        VARCHAR_36 id PK
        VARCHAR_36 meeting_id FK
        VARCHAR_36 user_id FK
        VARCHAR_64 participant_id UK
        VARCHAR_100 display_name
        VARCHAR_20 role
        BOOLEAN is_host
        BOOLEAN is_active
        BOOLEAN audio_enabled
        BOOLEAN video_enabled
        BOOLEAN screen_sharing
        BOOLEAN hand_raised
        BOOLEAN muted_by_host
        BOOLEAN removed_from_meeting
        DATETIME joined_at
        DATETIME left_at
        DATETIME created_at
        DATETIME updated_at
    }

    meeting_events {
        VARCHAR_36 id PK
        VARCHAR_36 meeting_id FK
        VARCHAR_64 participant_id
        VARCHAR_50 event_type
        TEXT metadata_
        DATETIME created_at
    }

    chat_messages {
        VARCHAR_36 id PK
        VARCHAR_36 meeting_id FK
        VARCHAR_64 participant_id
        VARCHAR_100 display_name
        TEXT message
        DATETIME created_at
        DATETIME deleted_at
    }

    reactions {
        VARCHAR_36 id PK
        VARCHAR_36 meeting_id FK
        VARCHAR_64 participant_id
        VARCHAR_100 display_name
        VARCHAR_20 reaction_type
        DATETIME created_at
    }
```

---

## 2. Table Indexing & Optimization

- **`meetings`**:
  - `ix_meetings_meeting_id` on `meeting_id` (Unique lookup for joins)
  - `ix_meetings_invite_token` on `invite_token` (Unique lookup for invite links)
  - `ix_meetings_host_user_id` on `host_user_id` (Filtered queries for upcoming/recent lists)
  - `ix_meetings_status` on `status` (Lifecycle state queries)
- **`meeting_participants`**:
  - `ix_meeting_participants_participant_id` on `participant_id` (Opaque lookup on WebSocket & REST)
  - `ix_meeting_participants_meeting_id` on `meeting_id` (Participant lists per meeting)
  - `ix_meeting_participants_is_active` on `is_active` (Active participant counts and state filters)

---

## 3. SQLite Compatibility & Conventions

1. **UUIDs**: Stored as canonical `VARCHAR(36)` strings. Avoids driver parameter binding issues with Python `uuid.UUID` objects in `aiosqlite`.
2. **Relationships**: Configured with `lazy="selectin"` to ensure asynchronous eager loading without triggering greenlet execution faults.
3. **Foreign Keys**: Enabled via PRAGMA `foreign_keys = ON` on all SQLite connection handshakes.
