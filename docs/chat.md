# Chat Documentation

## Overview

Real-time messaging powered by Socket.IO, with message persistence in MongoDB, voice transcription (Whisper), text translation (GPT-3.5), and video/audio call signaling (WebRTC).

## Architecture

```
Mobile App (Socket.IO client)
        │
        ▼
  chat-service (Socket.IO server)
  ├── Message persistence → MongoDB
  ├── Push notifications → notification-service
  ├── Voice transcription → OpenAI Whisper
  └── Text translation → OpenAI GPT-3.5
```

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ conversationId }` | Join a conversation room |
| `leave` | `{ conversationId }` | Leave a conversation room |
| `message` | `{ conversationId, content, mediaUrl?, messageType }` | Send message |
| `typing` | `{ conversationId, isTyping }` | Typing indicator |
| `read` | `{ conversationId, messageIds[] }` | Mark messages as read |
| `call:offer` | `{ conversationId, sdp, callType }` | Initiate WebRTC call |
| `call:answer` | `{ conversationId, sdp }` | Answer WebRTC call |
| `call:ice-candidate` | `{ conversationId, candidate }` | ICE candidate |
| `call:end` | `{ conversationId }` | End call |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message` | Message object | New message in conversation |
| `typing` | `{ userId, isTyping }` | Typing status |
| `read` | `{ userId, messageIds[] }` | Read receipt |
| `call:offer` | `{ from, sdp, callType }` | Incoming call |
| `call:answer` | `{ from, sdp }` | Call answered |
| `call:ice-candidate` | `{ from, candidate }` | ICE candidate |
| `call:end` | `{ from }` | Call ended |
| `error` | `{ message }` | Error |

## Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4004', {
  auth: { userId: 'user-id' },
  transports: ['websocket'],
});

socket.emit('join', { conversationId: 'conv-123' });
socket.on('message', (msg) => console.log(msg));
```

## REST API

### `GET /api/chat/:conversationId/messages`

Load message history with pagination.

Query params:
- `before`: ISO date for cursor pagination
- `limit`: Number of messages (default 50)

### `POST /api/translation/transcribe`

Transcribe a voice message.

**Request:** `multipart/form-data` with `audio` field (MP3/WAV/M4A, max 25MB)

**Response:**
```json
{
  "transcription": "transcribed text",
  "language": "en"
}
```

### `POST /api/translation/translate`

Translate text.

**Request:**
```json
{
  "text": "Buongiorno!",
  "targetLanguage": "English",
  "sourceLanguage": "Italian"
}
```

**Response:**
```json
{
  "original": "Buongiorno!",
  "translated": "Good morning!",
  "targetLanguage": "English",
  "sourceLanguage": "Italian"
}
```

## Video/Audio Calls (WebRTC POC)

The service relays WebRTC signaling messages between peers.

**Flow:**
1. Caller emits `call:offer` with SDP offer
2. Service broadcasts to conversation room
3. Callee answers with `call:answer`
4. Both exchange ICE candidates via `call:ice-candidate`
5. Either party ends call with `call:end`

For production, consider using **Agora** or **Twilio** for scalable video infrastructure.

## Required Environment Variables

```
MONGO_URL=mongodb://localhost:27017/beauty-chat
OPENAI_API_KEY=sk-...  (for Whisper + translation)
NOTIFICATION_SERVICE_URL=http://notification-service:4003
```

## Scaling

For horizontal scaling, use Socket.IO with Redis adapter:

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```
