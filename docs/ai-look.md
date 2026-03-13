# AI Look (Virtual Style) — Developer Guide

## Overview

The **AI Look** feature lets users upload a selfie and generate AI-powered
hairstyle previews. Users can then directly book a professional to replicate
the chosen look.

| Component | Path |
|-----------|------|
| Backend microservice | `backend/services/ai-style-service/` |
| BullMQ worker | `backend/services/ai-style-service/src/worker.js` |
| Mobile screen | `mobile/app/(tabs)/ai-look.tsx` |
| Prisma additions | `backend/shared/prisma/schema_additions.prisma` |
| Docker compose | `docker-compose.ai-style.yml` |

---

## Architecture

```
Mobile (Expo)
  └─► POST /api/ai-look/upload      → S3 upload → GeneratedLook record
  └─► POST /api/ai-look/generate    → BullMQ job queued
  └─► GET  /api/ai-look/status/:id  → poll until done
  └─► GET  /api/ai-look/result/:id  → get result URLs
  └─► POST /api/ai-look/save        → mark as saved
  └─► POST /api/ai-look/book        → create Booking linked to look

Worker (BullMQ)
  └─► Dequeue job → call Replicate API → upload results to S3 → update DB
```

---

## Required Environment Variables / GitHub Secrets

| Variable | Description |
|----------|-------------|
| `REPLICATE_API_TOKEN` | Replicate API key (primary AI provider) |
| `STABILITY_API_KEY` | Stability AI key (optional fallback) |
| `OPENAI_API_KEY` | OpenAI key (optional fallback) |
| `S3_BUCKET` | S3 bucket name |
| `S3_KEY` | S3 access key ID |
| `S3_SECRET` | S3 secret access key |
| `S3_REGION` | S3 region (e.g. `us-east-1`) |
| `S3_ENDPOINT` | Custom endpoint for DO Spaces / MinIO (optional) |
| `REDIS_HOST` | Redis host (default: `redis`) |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `FIREBASE_SERVER_KEY` | Firebase Cloud Messaging server key |

### Setting GitHub Secrets (web browser)

1. Go to your repository on GitHub.
2. Click **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret** for each variable above.
4. Paste the value and save. **Never commit the real values to git.**

---

## Local Development

### 1. Clone and set up environment

```bash
git clone https://github.com/mikimause93/-Beauty-Style-.git
cd -Beauty-Style-
cp .env.example .env
# Open .env and fill in real values
```

### 2. Start infrastructure

```bash
# Requires Docker and docker-compose
docker-compose up -d postgres mongodb redis
```

### 3. Run Prisma migration

```bash
cd backend/shared/prisma
npx prisma migrate dev --name add_generated_look
node seed.js
```

### 4. Start AI Style service + worker

```bash
docker-compose -f docker-compose.ai-style.yml up --build -d
# Or locally without Docker:
cd backend/services/ai-style-service
npm install
npm run dev          # starts API on :3011
npm run worker       # in another terminal
```

### 5. Start mobile app (Expo)

```bash
cd mobile
npm install
npx expo start
```

---

## API Reference

| Method | Endpoint | Body / Params |
|--------|----------|---------------|
| `POST` | `/api/ai-look/upload` | `multipart/form-data` field `photo` |
| `POST` | `/api/ai-look/generate` | `{ id, preset, params?, provider? }` |
| `GET`  | `/api/ai-look/status/:id` | — |
| `GET`  | `/api/ai-look/result/:id` | — |
| `POST` | `/api/ai-look/save` | `{ id }` |
| `POST` | `/api/ai-look/book` | `{ lookId, professionalId, date, startTime, totalPrice }` |

All endpoints require the `x-user-id` header (or a Bearer token once JWT middleware is plugged in).

---

## Presets

| Key | Description |
|-----|-------------|
| `bob-short` | Bob corto, naturale |
| `long-waves` | Onde lunghe e naturali |
| `pixie` | Pixie cut moderno |
| `fade-beard` | Fade e barba curata |
| `blonde-balayage` | Balayage biondo caldo |

---

## Testing Checklist

- [ ] `POST /api/ai-look/upload` with an image → receives `{ id, originalUrl }`
- [ ] `POST /api/ai-look/generate` with `id` and `preset` → `{ status: 'queued', id }`
- [ ] Worker processes job → `GET /api/ai-look/status/:id` returns `resultUrls`
- [ ] `POST /api/ai-look/save` marks record as saved
- [ ] `POST /api/ai-look/book` creates a `Booking` linked to `generatedLookId`
- [ ] Mobile screen displays results and "Prenota" button

---

## Notes on AI Providers

- **Primary**: [Replicate](https://replicate.com) — sign up and get an API token.
- **Fallback**: If Replicate fails or `REPLICATE_API_TOKEN` is not set, the
  original photo is returned unchanged (safe fallback for dev/testing).
- Production upgrade: swap to Stability AI or OpenAI DALL-E 3 by changing the
  `provider` field in the generate request.
