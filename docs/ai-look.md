# AI Look — Developer Guide

## Overview

The **AI Look** feature lets users preview a virtual hairstyle or beauty look on their own photo before booking a professional appointment.

| Component | Path |
|-----------|------|
| API microservice | `backend/services/ai-style-service/src/index.js` |
| BullMQ worker | `backend/services/ai-style-service/src/worker.js` |
| AI client (Replicate + fallback) | `backend/services/ai-style-service/src/lib/aiClient.js` |
| S3 helper | `backend/services/ai-style-service/src/lib/s3.js` |
| REST routes | `backend/services/ai-style-service/src/routes/ai.routes.js` |
| Prisma additions | `backend/shared/prisma/schema_additions.prisma` |
| Booking extension | `backend/shared/prisma/booking_extension.prisma` |
| Seed script | `backend/shared/prisma/seed.js` |
| Mobile screen | `mobile/app/(tabs)/ai-look.tsx` |
| Docker Compose | `docker-compose.ai-style.yml` |

---

## Required secrets / environment variables

Set these as **GitHub Actions secrets** (Settings → Secrets → Actions) and in your local `.env` (copy from `.env.example`):

| Variable | Purpose |
|----------|---------|
| `REPLICATE_API_TOKEN` | Primary AI image generation (Replicate) |
| `STABILITY_API_KEY` | Fallback AI provider (Stability AI) |
| `OPENAI_API_KEY` | Optional fallback (OpenAI) |
| `S3_BUCKET` | Object-storage bucket name |
| `S3_KEY` | S3 / Spaces access key ID |
| `S3_SECRET` | S3 / Spaces secret access key |
| `S3_REGION` | Bucket region (e.g. `us-east-1`) |
| `S3_ENDPOINT` | Custom endpoint for non-AWS providers (optional) |
| `REDIS_HOST` | Redis hostname (default: `redis`) |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `FIREBASE_SERVER_KEY` | FCM push notifications |

---

## Local development setup

```bash
# 1. Copy and fill secrets
cp .env.example .env

# 2. Start infrastructure (postgres, mongodb, redis)
docker-compose up -d postgres mongodb redis

# 3. Build and start the AI service + worker
docker-compose -f docker-compose.ai-style.yml up --build -d

# 4. Run Prisma migrations
cd backend/shared/prisma
npx prisma migrate dev --name add_generated_look

# 5. Seed demo presets
node backend/shared/prisma/seed.js
```

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/ai-look/upload` | Upload photo (multipart, field `photo`) → `{ id, originalUrl }` |
| `POST` | `/api/ai-look/generate` | Enqueue AI generation `{ id, preset, params?, provider? }` → `{ status, id }` |
| `GET` | `/api/ai-look/status/:id` | Poll status → `{ id, status, resultUrls }` |
| `GET` | `/api/ai-look/result/:id` | Get result URLs → `{ id, resultUrls, provider }` |
| `POST` | `/api/ai-look/save` | Mark look as saved `{ id }` |
| `POST` | `/api/ai-look/book` | Create booking linked to look `{ lookId, professionalId, serviceId, date, startTime, totalPrice }` |
| `GET` | `/health` | Health check |

---

## Available presets

| Key | Description |
|-----|-------------|
| `bob-short` | Bob corto, naturale |
| `long-waves` | Onde lunghe e naturali |
| `pixie` | Pixie cut moderno |
| `fade-beard` | Fade e barba curata |
| `blonde-balayage` | Balayage biondo caldo |

---

## Manual test walkthrough

```bash
# Upload a photo
curl -X POST http://localhost:3011/api/ai-look/upload \
  -H "x-user-id: test-user" \
  -F "photo=@/path/to/photo.jpg"
# → { "id": "<lookId>", "originalUrl": "https://..." }

# Queue generation
curl -X POST http://localhost:3011/api/ai-look/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"id":"<lookId>","preset":"bob-short"}'

# Poll status (repeat until resultUrls is non-empty)
curl http://localhost:3011/api/ai-look/status/<lookId>

# Get result
curl http://localhost:3011/api/ai-look/result/<lookId>

# Save look
curl -X POST http://localhost:3011/api/ai-look/save \
  -H "Content-Type: application/json" \
  -d '{"id":"<lookId>"}'
```
