# Beauty & Style Platform 💄✨

> Complete Beauty & Style Platform — AI Look Generation, Professional Booking, Real-time Chat, Push Notifications, Social Features.

## 🌟 Features

- **✨ AI Look Studio** — Upload selfies, choose style presets, generate AI-styled beauty looks
- **📅 Smart Booking** — Book professionals with Stripe payment integration
- **💬 Real-time Chat** — Socket.IO messaging with voice transcription and translation
- **🔔 Push Notifications** — FCM push with deep links to every screen
- **🔍 Search** — Autocomplete users/professionals and "Near Me" map view
- **🎵 Global Music Player** — Royalty-free background music with in-app search
- **👏 Social Features** — Comments, replies, likes with full user names, applause
- **💳 Wallet** — Link IBAN/bank accounts, Stripe card payments

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│            Mobile App (Expo)                │
│  React Navigation · Zustand · Socket.IO     │
└──────────┬───────────────┬──────────────────┘
           │               │
    ┌──────▼──────┐  ┌─────▼──────────┐
    │ REST APIs   │  │ Socket.IO      │
    └──────┬──────┘  └─────┬──────────┘
           │               │
┌──────────▼───────────────▼──────────────────┐
│             Microservices                   │
│  ┌──────────────┐  ┌──────────────────┐     │
│  │ ai-style (4005)│ │ booking (4002)   │     │
│  └──────────────┘  └──────────────────┘     │
│  ┌──────────────┐  ┌──────────────────┐     │
│  │ notification  │  │ chat (4004)      │     │
│  │ (4003)        │  └──────────────────┘     │
│  └──────────────┘                            │
└──────────┬───────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────┐
│         Infrastructure                      │
│  PostgreSQL · Redis · MongoDB               │
│  S3 (photos) · FCM (push)                   │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Expo CLI

### 1. Environment Setup

```bash
cp .env.example .env
# Edit .env and fill in your secrets (see Required Secrets below)
```

### 2. Start All Services

```bash
docker-compose up -d
```

### 3. Database Setup

```bash
# Run migrations
cd backend/shared/prisma
npx prisma migrate deploy

# Seed demo data
node seed.js
```

### 4. Start AI Worker

```bash
docker-compose up ai-style-worker
# or locally:
cd backend/services/ai-style-service
npm install && npm run worker
```

### 5. Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

## 🔑 Required Secrets

> **Never commit secrets to the repository!**  
> Set these in GitHub → Settings → Secrets and Variables → Actions, and in your `.env` file.

| Secret | Description |
|--------|-------------|
| `REPLICATE_API_TOKEN` | [Replicate](https://replicate.com) API token |
| `STABILITY_API_KEY` | [Stability AI](https://stability.ai) API key |
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com) API key |
| `S3_BUCKET` | AWS S3 bucket name |
| `S3_KEY` | AWS access key ID |
| `S3_SECRET` | AWS secret access key |
| `S3_REGION` | AWS region (e.g., `us-east-1`) |
| `STRIPE_SECRET_KEY` | [Stripe](https://stripe.com) secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON (stringified) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |

### Setting GitHub Secrets

```bash
gh secret set REPLICATE_API_TOKEN --body "r8_your_token_here"
gh secret set STRIPE_SECRET_KEY --body "sk_test_..."
# ... (repeat for all secrets)
```

Or go to: `https://github.com/mikimause93/-Beauty-Style-/settings/secrets/actions`

## 📁 Project Structure

```
├── backend/
│   ├── services/
│   │   ├── ai-style-service/     # AI Look microservice (port 4005)
│   │   ├── booking-service/      # Booking + Stripe (port 4002)
│   │   ├── notification-service/ # FCM push (port 4003)
│   │   └── chat-service/         # Socket.IO + translation (port 4004)
│   └── shared/
│       └── prisma/               # Schema, migrations, seed
├── mobile/                       # Expo React Native app
│   └── src/
│       ├── screens/              # App screens
│       ├── components/           # Reusable components
│       ├── store/                # Zustand state management
│       ├── theme/                # Colors, spacing, fonts
│       ├── navigation/           # React Navigation setup
│       └── utils/                # Helpers (notifications, etc.)
├── docs/                         # Service documentation
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

## 📚 Documentation

- [AI Look Feature](docs/ai-look.md)
- [Push Notifications](docs/notifications.md)
- [Real-time Chat](docs/chat.md)

## 🧪 Testing

```bash
# AI Style Service tests
cd backend/services/ai-style-service && npm test

# Booking Service tests
cd backend/services/booking-service && npm test

# Notification Service tests
cd backend/services/notification-service && npm test

# Chat Service tests
cd backend/services/chat-service && npm test
```

## 🎨 UI Theme

Primary color: **Violet `#667eea`**

See `mobile/src/theme/index.js` for the complete design token system.

## 🔒 Privacy & Moderation

- **Consent flow**: Users must explicitly consent before photo upload
- **NSFW moderation**: All uploaded photos are scanned before AI processing
- Configure threshold via `NSFW_THRESHOLD` env var (0.0–1.0, default 0.5)
- Photos stored in private S3 with presigned URLs for access

## License

MIT
