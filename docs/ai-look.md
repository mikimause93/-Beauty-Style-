# AI Look (Virtual Style) – Developer Guide

## Overview

The AI Look feature lets users upload a photo and generate virtual hairstyle / beauty previews powered by AI.

### Architecture

```
Mobile App (Expo)
    │  multipart/form-data upload
    ▼
ai-style-service (Express :3011)
    │  enqueues job
    ▼
Redis (BullMQ queue: 'ai-style')
    │  job consumed by
    ▼
ai-style-worker (BullMQ Worker)
    │  calls provider (Replicate → Stability → OpenAI)
    │  uploads results to S3
    ▼
GeneratedLook record (Postgres via Prisma)
    │  mobile polls /api/ai-look/status/:id
    ▼
Results displayed → user can Save or Book
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/ai-look/upload` | Upload original photo (multipart) |
| POST | `/api/ai-look/generate` | Queue generation job |
| GET | `/api/ai-look/status/:id` | Poll status |
| GET | `/api/ai-look/result/:id` | Get result URLs |
| POST | `/api/ai-look/save` | Save to portfolio |
| POST | `/api/ai-look/book` | Create booking |

## Required Secrets / Environment Variables

Set these in **GitHub → Settings → Secrets and Variables → Actions** and also in your local `.env`:

| Variable | Description |
|----------|-------------|
| `REPLICATE_API_TOKEN` | Replicate API token (primary AI provider) |
| `STABILITY_API_KEY` | Stability AI API key (fallback) |
| `OPENAI_API_KEY` | OpenAI API key (last fallback) |
| `S3_BUCKET` | S3/Spaces bucket name |
| `S3_KEY` | S3 access key ID |
| `S3_SECRET` | S3 secret access key |
| `S3_REGION` | S3 region (e.g. `us-east-1`) |
| `S3_ENDPOINT` | Optional: custom endpoint for DO Spaces/MinIO |
| `REDIS_HOST` | Redis hostname (default: `redis`) |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (booking payments) |
| `FIREBASE_SERVER_KEY` | Firebase server key (push notifications) |

## Local Development

### Prerequisites
- Docker Desktop
- Node.js 20+

### Steps

```bash
# 1. Clone and setup environment
cp .env.example .env
# Edit .env and fill in your secrets

# 2. Start infrastructure
docker-compose up -d postgres redis

# 3. Run Prisma migration
cd backend/shared/prisma
npx prisma migrate dev --name init
npx prisma db seed  # or: node seed.js

# 4. Start AI Style Service
cd backend/services/ai-style-service
npm install
npm run dev

# 5. Start the worker (separate terminal)
cd backend/services/ai-style-service
npm run worker

# 6. Start mobile (separate terminal)
cd mobile
npx expo start
```

### Docker Compose (all services)

```bash
cp .env.example .env   # fill secrets
docker-compose up -d --build
```

## Manual Test Checklist

- [ ] `GET http://localhost:3011/health` → `{ status: 'ok' }`
- [ ] `POST /api/ai-look/upload` with multipart `photo` field → returns `{ id, originalUrl }`
- [ ] `POST /api/ai-look/generate` with `{ id, preset: 'bob-short' }` → returns `{ status: 'queued', id }`
- [ ] Worker logs show "Processing job ..."
- [ ] `GET /api/ai-look/status/:id` → eventually returns `{ status: 'done', resultUrls: [...] }`
- [ ] `POST /api/ai-look/save` → `{ status: 'saved' }`
- [ ] `POST /api/ai-look/book` → returns booking object with `generatedLookId`

## AI Presets Available

| Key | Description |
|-----|-------------|
| `bob-short` | Bob corto, naturale |
| `long-waves` | Onde lunghe e naturali |
| `pixie` | Pixie cut moderno |
| `fade-beard` | Fade e barba curata |
| `blonde-balayage` | Balayage biondo caldo |

## Production Notes

- **Replicate polling**: the current implementation polls up to 40 times with 3 s intervals. For production, consider Replicate webhooks instead.
- **NSFW moderation**: a placeholder hook exists in `ai.routes.js`. Integrate Google Vision SafeSearch or AWS Rekognition before go-live.
- **Rate limiting**: add `express-rate-limit` middleware to `/api/ai-look/generate` to prevent abuse.
- **Cost control**: implement per-user credit limits before enabling for all users.
