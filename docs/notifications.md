# Notifications Documentation

## Overview

The notification service handles push notifications via Firebase Cloud Messaging (FCM) for both iOS and Android, with deep link support to navigate users to the correct screen.

## Architecture

```
Any Service (booking, ai-style, chat)
        │
        ▼
POST /internal/notify
        │
  Notification Service
  ├── Saves Notification to PostgreSQL
  ├── Looks up FCM token from User
  └── Sends FCM data-only push
        │
        ▼
  Firebase → Device
  Mobile app handles deep link
```

## Notification Types

| Type | Trigger | Deep Link |
|------|---------|-----------|
| `AI_LOOK_READY` | Worker completes generation | `beautyapp://ai-look/result/:id` |
| `BOOKING_CONFIRMED` | Stripe webhook confirms payment | `beautyapp://booking/:id` |
| `BOOKING_CANCELLED` | Booking cancelled | `beautyapp://booking/:id` |
| `PAYMENT_SUCCESS` | Stripe payment succeeds | `beautyapp://booking/:id` |
| `PAYMENT_FAILED` | Stripe payment fails | `beautyapp://booking/:id/retry-payment` |
| `NEW_MESSAGE` | Chat message received | `beautyapp://chat/:conversationId` |
| `NEW_COMMENT` | Comment on user post | `beautyapp://post/:postId` |
| `NEW_LIKE` | Like on user post | `beautyapp://post/:postId` |
| `NEW_APPLAUSE` | Applause on user post | `beautyapp://post/:postId` |
| `SYSTEM` | Admin system message | varies |

## Internal API

### `POST /internal/notify`

Called by other microservices to trigger a notification.

```json
{
  "userId": "user-id",
  "type": "AI_LOOK_READY",
  "targetId": "look-id",
  "targetType": "GeneratedLook",
  "actorId": "optional-actor-id",
  "deepLink": "beautyapp://ai-look/result/look-id",
  "payload": {
    "resultUrl": "https://...",
    "preset": "glam"
  }
}
```

## Mobile Deep Link Handling

The mobile app handles deep links in `src/utils/notificationHandler.js`:

### FCM Token Registration

On app startup:
1. Request push permission
2. Get FCM token
3. Register token with backend via `POST /api/users/fcm-token`

### Notification States

- **Foreground**: App displays local notification popup
- **Background**: System notification shown; tap navigates to screen
- **Quit**: `getInitialNotification()` triggers on app open

### Navigation Map

```javascript
switch(type) {
  case 'AI_LOOK_READY':    → AILookScreen (resultId)
  case 'BOOKING_CONFIRMED': → BookingDetailScreen (bookingId)
  case 'NEW_MESSAGE':       → ChatScreen (conversationId)
  case 'NEW_COMMENT':       → PostDetailScreen (postId)
}
```

## FCM Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Add Android and iOS apps
3. Download `google-services.json` and `GoogleService-Info.plist`
4. Generate a service account key (Project Settings → Service Accounts)
5. Set `FIREBASE_SERVICE_ACCOUNT` environment variable

## Required Environment Variables

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
DATABASE_URL=postgresql://...
```

## API Endpoints

### `GET /api/notifications`

Get notifications for authenticated user.

Headers: `x-user-id: <userId>`

### `PATCH /api/notifications/:id/read`

Mark notification as read.

### `PATCH /api/notifications/read-all`

Mark all notifications as read.
