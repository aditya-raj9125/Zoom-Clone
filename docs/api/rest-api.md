# REST API Reference

All REST endpoints are rooted at `/api/v1`.

Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`  
ReDoc Documentation: `http://127.0.0.1:8000/redoc`

---

## 1. System Health
### `GET /api/v1/health`
- **Description**: Probes service status and database connectivity.
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 2. Users
### `GET /api/v1/users/me`
- **Description**: Retrieves the default seeded user (`Aditya Raj`).
- **Response**: `200 OK`
```json
{
  "id": "77385e67-04a7-4b71-8e9a-e00bef4f621e",
  "display_name": "Aditya Raj",
  "email": "aditya.raj@zoomclone.local",
  "avatar_url": null,
  "is_default_user": true,
  "created_at": "2026-09-07T10:00:00Z"
}
```

---

## 3. Meetings Lifecycle
### `POST /api/v1/meetings`
- **Description**: Creates an instant meeting in `live` status.
- **Request Body**:
```json
{
  "title": "Quick Sync",
  "description": "Optional agenda"
}
```
- **Response**: `201 Created`

### `POST /api/v1/meetings/schedule`
- **Description**: Schedules a future meeting. Validates that start time is in the future (UTC) and duration is between 1 and 1440 minutes.
- **Request Body**:
```json
{
  "title": "Design Review",
  "scheduled_start_at": "2026-09-08T15:00:00Z",
  "duration_minutes": 45
}
```
- **Response**: `201 Created`

### `GET /api/v1/meetings/upcoming`
- **Description**: Returns all future scheduled meetings for current user, ordered by `scheduled_start_at ASC`.

### `GET /api/v1/meetings/recent?page=1&page_size=20`
- **Description**: Returns a paginated list of past/created meetings ordered by creation time descending.

### `GET /api/v1/meetings/{meeting_id}`
- **Description**: Looks up public details for a 10-digit meeting ID.

### `POST /api/v1/meetings/{meeting_id}/start`
- **Description**: Transitions a scheduled meeting to `live`. Host authorization required via `?actor_participant_id={host_pid}`.

### `POST /api/v1/meetings/{meeting_id}/end`
- **Description**: Host concludes meeting. Transitions status to `ended`, deactivates all participants, and disconnects all WebSocket sockets.

---

## 4. Participants & Moderation
### `POST /api/v1/meetings/join`
- **Request Body**:
```json
{
  "meeting_id": "8461249264",
  "display_name": "Priya Sharma",
  "passcode": "eWklt0"
}
```
- **Response**: `200 OK`
```json
{
  "participant_id": "bOI_AkJ7uhv-GqBMMadvbw",
  "meeting_id": "8461249264",
  "display_name": "Priya Sharma",
  "role": "participant",
  "is_host": false,
  "websocket_url": "ws://localhost:8000/api/v1/ws/meetings/8461249264",
  "meeting": { ... }
}
```

### `POST /api/v1/meetings/join-by-invite`
- **Request Body**:
```json
{
  "invite_token": "uypnWppDTqvcpSMFfVZ0gjbpkGQQPsXV-LwlxOO45oo",
  "display_name": "Guest Participant"
}
```

### `GET /api/v1/meetings/{meeting_id}/participants`
- **Description**: Lists active participants currently inside the meeting room.

### `PATCH /api/v1/meetings/{meeting_id}/participants/{pid}/audio`
- **Request Body**: `{"enabled": true}`

### `PATCH /api/v1/meetings/{meeting_id}/participants/{pid}/video`
- **Request Body**: `{"enabled": false}`

### `PATCH /api/v1/meetings/{meeting_id}/participants/{pid}/screen-share`
- **Request Body**: `{"sharing": true}` (Arbitrated: stops existing sharer).

### `POST /api/v1/meetings/{meeting_id}/participants/{pid}/mute`
- **Description**: Host mutes specific participant.

### `POST /api/v1/meetings/{meeting_id}/mute-all`
- **Description**: Host mutes all active non-host participants.

### `DELETE /api/v1/meetings/{meeting_id}/participants/{pid}`
- **Description**: Host kicks/removes a participant from the meeting.

---

## 5. In-Meeting Chat & Reactions
### `GET /api/v1/meetings/{meeting_id}/chat`
- **Description**: Retrieves chronological chat messages for the meeting.

### `POST /api/v1/meetings/{meeting_id}/chat`
- **Request Body**: `{"participant_id": "pid", "message": "Hello world!"}`

### `POST /api/v1/meetings/{meeting_id}/reactions`
- **Request Body**: `{"participant_id": "pid", "reaction_type": "clap"}`
