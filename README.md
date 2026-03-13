# -Beauty-Style-

**Stayle Beauty** – Complete Beauty & Style Platform (55 Screens, 12 Features)

A full-stack beauty booking & style platform featuring:
- AI-powered virtual look generation (AI Look)
- Professional booking with Stripe payments
- Real-time chat (Socket.IO)
- Push notifications (Firebase FCM)
- Nearby professional search (geo-based)

## Repository Structure

```
.
├── backend/
│   ├── services/
│   │   └── ai-style-service/   # AI Look microservice (Express + BullMQ)
│   └── shared/
│       └── prisma/              # Prisma schema, migrations, seed
├── mobile/
│   └── app/
│       └── (tabs)/
│           └── ai-look.tsx      # Expo React Native AI Look screen
├── docs/
│   └── ai-look.md               # AI Look developer guide
├── docker-compose.yml
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml
```

## Quick Start

```bash
cp .env.example .env
# Fill in secrets in .env

docker-compose up -d --build
```

See [docs/ai-look.md](docs/ai-look.md) for detailed setup and testing instructions.

## Required Secrets

See `.env.example` for the full list of environment variables.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_HOST` / `REDIS_PORT` | BullMQ queue |
| `S3_BUCKET` / `S3_KEY` / `S3_SECRET` | Object storage |
| `REPLICATE_API_TOKEN` | Primary AI provider |
| `STABILITY_API_KEY` | Secondary AI provider |
| `OPENAI_API_KEY` | Tertiary AI provider |
| `JWT_SECRET` | Auth token signing |
| `STRIPE_SECRET_KEY` | Payment processing |
| `FIREBASE_SERVER_KEY` | Push notifications |

## License

MIT
