# AI Look Documentation

## Overview

The **AI Look** feature lets users upload a selfie and generate AI-styled beauty looks. The system uses Replicate as primary provider with Stability AI and OpenAI DALL-E as fallbacks.

## Architecture

```
Mobile App
  │
  ├── POST /api/ai-look/upload     ← Upload photo to S3 + NSFW moderation
  ├── POST /api/ai-look/generate   ← Enqueue BullMQ job
  ├── GET  /api/ai-look/status/:id ← Poll job status
  ├── GET  /api/ai-look/result/:id ← Fetch saved GeneratedLook
  ├── POST /api/ai-look/save       ← Save look to user collection
  └── POST /api/ai-look/book       ← Create booking from look
         │
         ▼
  BullMQ Queue (Redis)
         │
         ▼
  AI Worker (aiWorker.js)
    ├── Calls Replicate (primary)
    ├── Falls back to Stability AI
    └── Falls back to OpenAI
         │
         ▼
  GeneratedLook stored in PostgreSQL
  Notification sent to user via FCM
```

## Endpoints

### `POST /api/ai-look/upload`

Upload user photo. Requires user consent.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `photo` | File | JPEG/PNG image (max 10MB) |
| `consentAccepted` | string | Must be `"true"` |

**Response:**
```json
{
  "uploadId": "uuid-v4",
  "url": "https://bucket.s3.amazonaws.com/uploads/...",
  "message": "Photo uploaded successfully"
}
```

---

### `POST /api/ai-look/generate`

Enqueue generation job.

**Request:**
```json
{
  "uploadId": "uuid-from-upload",
  "userId": "user-id",
  "preset": "glam",
  "styleOptions": {}
}
```

**Response:**
```json
{
  "jobId": "bullmq-job-id",
  "status": "queued",
  "message": "Generation job enqueued..."
}
```

---

### `GET /api/ai-look/status/:jobId`

Poll generation status.

**Response:**
```json
{
  "jobId": "...",
  "state": "completed",
  "progress": 100,
  "result": {
    "lookId": "...",
    "resultUrls": ["https://..."]
  }
}
```

States: `waiting` → `active` → `completed` | `failed`

---

### `GET /api/ai-look/result/:id`

Fetch a saved GeneratedLook by DB id.

---

### `POST /api/ai-look/save`

Save result to user's collection.

**Request:**
```json
{
  "jobId": "...",
  "userId": "...",
  "resultUrl": "https://...",
  "preset": "glam"
}
```

---

### `POST /api/ai-look/book`

Create a booking from a generated look.

**Request:**
```json
{
  "generatedLookId": "...",
  "userId": "...",
  "professionalId": "...",
  "scheduledAt": "2024-12-01T10:00:00Z",
  "notes": "Please bring reference photos"
}
```

## Style Presets

| Preset | Description |
|--------|-------------|
| `natural` | Fresh everyday look |
| `glam` | Dramatic glamour |
| `editorial` | Magazine artistry |
| `bridal` | Romantic wedding look |
| `smoky` | Sultry smoky eye |

## Privacy & Consent

- Users must explicitly accept consent before uploading photos
- Photos are scanned with NSFW moderation before processing
- Set `NSFW_THRESHOLD` (0–1) to control sensitivity
- Photos stored in S3 with private access; presigned URLs for viewing

## Worker Setup

Start the worker separately:
```bash
cd backend/services/ai-style-service
npm run worker
# or via docker-compose:
docker-compose up ai-style-worker
```

## Required Environment Variables

```
REPLICATE_API_TOKEN=r8_...
STABILITY_API_KEY=sk-...
OPENAI_API_KEY=sk-...
S3_BUCKET=...
S3_KEY=...
S3_SECRET=...
S3_REGION=us-east-1
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://...
NSFW_THRESHOLD=0.5
```

## Running Tests

```bash
cd backend/services/ai-style-service
npm test
```

Tests are in `src/tests/` and use mocked AI providers, S3, and Prisma.
