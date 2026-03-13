# AI Style Service

Microservice for AI-powered virtual style / look generation for the Beauty & Style platform.

## Architecture

- **Framework**: Express.js
- **Queue**: BullMQ (Redis-backed)
- **Storage**: S3-compatible (AWS S3, DigitalOcean Spaces)
- **AI Providers**: Replicate (primary) → Stability AI → OpenAI (fallback chain)
- **Auth**: JWT bearer token (HS256), dev fallback via `x-user-id` header

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/ai-look/upload` | Upload original photo |
| POST | `/api/ai-look/generate` | Queue AI generation job |
| GET | `/api/ai-look/status/:id` | Poll job status |
| GET | `/api/ai-look/result/:id` | Retrieve result URLs |
| POST | `/api/ai-look/save` | Save look to portfolio |
| POST | `/api/ai-look/book` | Create booking for a look |

## Local Development

```bash
cp ../../.env.example .env
# Fill in secrets in .env
npm install
npm run dev       # starts API server on :3011
npm run worker    # starts BullMQ worker (in a separate terminal)
npm test          # run unit + integration tests
```

## Environment Variables

See `.env.example` in the repository root for all required variables.

Key variables for this service:
- `AI_STYLE_PORT` – port to listen on (default: 3011)
- `REDIS_HOST` / `REDIS_PORT` – BullMQ queue connection
- `S3_BUCKET` / `S3_KEY` / `S3_SECRET` / `S3_REGION` / `S3_ENDPOINT` – object storage
- `REPLICATE_API_TOKEN` – primary AI provider
- `STABILITY_API_KEY` – secondary AI provider
- `OPENAI_API_KEY` – tertiary AI provider
- `JWT_SECRET` – JWT verification (omit to use dev fallback)
- `DATABASE_URL` – shared Postgres connection
