## Description

<!-- Describe the changes made in this PR -->

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update
- [ ] Infrastructure / CI update

## Changes Made

<!-- List all changes -->

## Testing Checklist

### Infrastructure
- [ ] `docker-compose up -d` starts all services (postgres, redis, mongodb, all microservices)
- [ ] All services respond to `/health` endpoint
- [ ] Prisma migrations applied: `npx prisma migrate deploy`
- [ ] Seed data loaded: `node backend/shared/prisma/seed.js`

### AI Look Feature
- [ ] Upload a photo via `POST /api/ai-look/upload` (with `consentAccepted: "true"`)
- [ ] NSFW moderation rejects inappropriate images
- [ ] Enqueue generation via `POST /api/ai-look/generate`
- [ ] Start worker: `npm run worker` in `ai-style-service`
- [ ] Poll status via `GET /api/ai-look/status/:jobId` until `completed`
- [ ] `resultUrls` array is populated in the result
- [ ] GeneratedLook saved to database
- [ ] FCM push notification received on device

### Booking & Payment
- [ ] Create booking via `POST /api/bookings`
- [ ] Confirm booking via `POST /api/bookings/confirm` → returns Stripe `clientSecret`
- [ ] Stripe webhook received and updates booking to `confirmed`
- [ ] Payment success FCM push received
- [ ] Add IBAN via `POST /api/wallet/bank-account` validates IBAN format

### Notifications
- [ ] `POST /internal/notify` saves notification to DB and sends FCM push
- [ ] Deep link from notification opens correct screen
- [ ] `GET /api/notifications` returns user notifications
- [ ] Mark as read works

### Chat
- [ ] Socket.IO connection established
- [ ] Messages sent and received in real-time
- [ ] Messages persisted in MongoDB
- [ ] Typing indicator works
- [ ] `POST /api/translation/translate` returns translated text
- [ ] `POST /api/translation/transcribe` returns transcription (with audio file)

### Mobile App
- [ ] AI Look screen: photo upload, preset selection, generate, results display
- [ ] Book from AI Look navigates to booking
- [ ] Search autocomplete shows users/pros
- [ ] Map view shows nearby professionals with radius filter
- [ ] Global music player persists across screens
- [ ] Deep links from notifications navigate to correct screens
- [ ] Comment thread: reply, applause, likes list with full names

## Required Secrets

Before testing, ensure these secrets are set (in `.env` or GitHub Actions):

```
REPLICATE_API_TOKEN
STABILITY_API_KEY
OPENAI_API_KEY
S3_BUCKET, S3_KEY, S3_SECRET, S3_REGION
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
FIREBASE_SERVICE_ACCOUNT
DATABASE_URL
REDIS_URL
JWT_SECRET
```

## Breaking Changes

<!-- List any breaking changes -->

## Screenshots / Screen Recordings

<!-- Add screenshots or recordings of UI changes -->
