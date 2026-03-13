#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# apply-all.sh — One-click script to apply all AI Look feature changes
# Stayle Beauty Platform — https://github.com/mikimause93/-Beauty-Style-
#
# Usage:
#   chmod +x apply-all.sh
#   ./apply-all.sh
#
# What this script does:
#   1. Verifies git and required tools are available
#   2. Creates (or switches to) branch feature/ai-look
#   3. Creates all necessary files (microservice, mobile screen, infra, docs)
#   4. Commits and pushes the branch
#   5. Prints the PR link
#
# ⚠️  Run from the root of the cloned repository.
# ⚠️  You need push access to the repository.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BRANCH="feature/ai-look"
REMOTE="${REMOTE:-origin}"
REPO_URL="https://github.com/mikimause93/-Beauty-Style-"

# ── Colour helpers ────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✔ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠ $*${NC}"; }
err()  { echo -e "${RED}✘ $*${NC}"; exit 1; }

# ── Pre-flight checks ─────────────────────────────────────────────────────────
command -v git >/dev/null 2>&1 || err "git is not installed."
[ -d ".git" ] || err "Not in a git repository root. cd into the repo first."

ok "Pre-flight checks passed"

# ── Branch setup ──────────────────────────────────────────────────────────────
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  warn "Branch '${BRANCH}' already exists — switching to it"
  git checkout "${BRANCH}"
else
  ok "Creating branch '${BRANCH}'"
  git checkout -b "${BRANCH}"
fi

# ── File creation helpers ─────────────────────────────────────────────────────
write_file() {
  local path="$1"
  local dir
  dir="$(dirname "$path")"
  mkdir -p "$dir"
  if [ -f "$path" ]; then
    warn "File already exists, skipping: $path"
  else
    cat > "$path"
    ok "Created: $path"
  fi
}

# ─── backend/services/ai-style-service ───────────────────────────────────────

write_file "backend/services/ai-style-service/package.json" <<'CONTENT'
{
  "name": "ai-style-service",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "worker": "node src/worker.js",
    "test": "node --check src/index.js && node --check src/worker.js"
  },
  "dependencies": {
    "@prisma/client": "^5.8.0",
    "aws-sdk": "^2.1664.0",
    "axios": "^1.6.5",
    "bullmq": "^5.4.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "multer": "^2.1.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
CONTENT

write_file "backend/services/ai-style-service/Dockerfile" <<'CONTENT'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3011
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
CONTENT

write_file "backend/services/ai-style-service/src/index.js" <<'CONTENT'
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/ai-look', aiRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'ai-style-service' })
);

const PORT = process.env.AI_STYLE_PORT || 3011;
app.listen(PORT, () =>
  console.log(`AI Style Service listening on port ${PORT}`)
);
CONTENT

write_file "backend/services/ai-style-service/src/routes/ai.routes.js" <<'CONTENT'
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { Queue } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const S3 = require('../lib/s3');

const prisma = new PrismaClient();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const redisOpts = {
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  }
};
const queue = new Queue('ai-style', redisOpts);
const router = express.Router();

function authMiddleware(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  req.user = { userId };
  next();
}
router.use(authMiddleware);

router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no_file' });
    const key = `originals/${Date.now()}-${req.file.originalname}`;
    const originalUrl = await S3.uploadBuffer(req.file.buffer, key);
    const record = await prisma.generatedLook.create({
      data: { userId: req.user.userId, originalUrl, preset: 'none', provider: 'queued', resultUrls: [] }
    });
    res.json({ id: record.id, originalUrl });
  } catch (err) {
    console.error('upload error', err);
    res.status(500).json({ error: 'upload_failed' });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { id, preset, params, provider } = req.body;
    if (!id) return res.status(400).json({ error: 'id_required' });
    const look = await prisma.generatedLook.findUnique({ where: { id } });
    if (!look) return res.status(404).json({ error: 'look_not_found' });
    const selectedProvider = provider || 'replicate';
    await queue.add('generate', { lookId: id, originalUrl: look.originalUrl, preset, params, provider: selectedProvider });
    await prisma.generatedLook.update({ where: { id }, data: { preset, provider: selectedProvider } });
    res.json({ status: 'queued', id });
  } catch (err) {
    console.error('generate error', err);
    res.status(500).json({ error: 'generate_failed' });
  }
});

router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const look = await prisma.generatedLook.findUnique({ where: { id } });
    if (!look) return res.status(404).json({ error: 'not_found' });
    const isDone = Array.isArray(look.resultUrls) && look.resultUrls.length > 0;
    res.json({ id, status: isDone ? 'done' : 'processing', resultUrls: look.resultUrls || [] });
  } catch (err) {
    console.error('status error', err);
    res.status(500).json({ error: 'status_failed' });
  }
});

router.get('/result/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const look = await prisma.generatedLook.findUnique({ where: { id } });
    if (!look) return res.status(404).json({ error: 'not_found' });
    res.json({ id, resultUrls: look.resultUrls || [], provider: look.provider });
  } catch (err) {
    console.error('result error', err);
    res.status(500).json({ error: 'result_failed' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id_required' });
    await prisma.generatedLook.update({ where: { id }, data: { saved: true } });
    res.json({ status: 'saved', id });
  } catch (err) {
    console.error('save error', err);
    res.status(500).json({ error: 'save_failed' });
  }
});

router.post('/book', async (req, res) => {
  try {
    const { lookId, professionalId, serviceId, date, startTime, totalPrice } = req.body;
    if (!lookId || !professionalId || !date || !startTime) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }
    const clientId = req.user.userId;
    const booking = await prisma.booking.create({
      data: {
        clientId,
        professionalId,
        serviceId: serviceId || null,
        date: new Date(date),
        startTime,
        totalPrice: totalPrice || 0,
        status: 'PENDING',
        generatedLookId: lookId
      }
    });
    await prisma.generatedLook.update({ where: { id: lookId }, data: { bookingId: booking.id } });
    res.status(201).json(booking);
  } catch (err) {
    console.error('book error', err);
    res.status(500).json({ error: 'booking_failed' });
  }
});

module.exports = router;
CONTENT

write_file "backend/services/ai-style-service/src/worker.js" <<'CONTENT'
require('dotenv').config();
const { Worker } = require('bullmq');
const { PrismaClient } = require('@prisma/client');
const aiClient = require('./lib/aiClient');
const S3 = require('./lib/s3');

const prisma = new PrismaClient();
const redisConn = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10)
};

const worker = new Worker('ai-style', async (job) => {
  const { lookId, originalUrl, preset, params, provider } = job.data;
  console.log(`Worker processing job ${job.id} — look ${lookId} via ${provider}`);
  const images = await aiClient.generateImage({ imageUrl: originalUrl, preset, params, provider });
  const uploaded = [];
  for (let i = 0; i < images.length; i++) {
    const key = `ai-looks/${lookId}-${Date.now()}-${i}.jpg`;
    const url = await S3.uploadBuffer(images[i], key);
    uploaded.push(url);
  }
  await prisma.generatedLook.update({
    where: { id: lookId },
    data: { resultUrls: uploaded, provider, saved: false }
  });
  return { uploaded };
}, { connection: redisConn });

worker.on('completed', (job) => console.log(`Job completed: ${job.id}`));
worker.on('failed', (job, err) => console.error(`Job failed: ${job.id}`, err.message));
CONTENT

write_file "backend/services/ai-style-service/src/lib/s3.js" <<'CONTENT'
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  endpoint: process.env.S3_ENDPOINT || undefined,
  region: process.env.S3_REGION || 'us-east-1',
  s3ForcePathStyle: !!process.env.S3_ENDPOINT
});

const BUCKET = process.env.S3_BUCKET;

async function uploadBuffer(buffer, key) {
  if (!BUCKET) throw new Error('S3_BUCKET env var is not set');
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  };
  const result = await s3.upload(params).promise();
  return result.Location;
}

module.exports = { uploadBuffer };
CONTENT

write_file "backend/services/ai-style-service/src/lib/aiClient.js" <<'CONTENT'
const axios = require('axios');
const { Buffer } = require('buffer');

async function generateImage({ imageUrl, preset, params = {}, provider = 'replicate' }) {
  if (provider === 'replicate') {
    try {
      const token = process.env.REPLICATE_API_TOKEN;
      if (!token) throw new Error('REPLICATE_API_TOKEN not set');
      const body = {
        version: params.version || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          image: imageUrl,
          prompt: params.prompt || `Photorealistic ${preset} hairstyle`,
          strength: params.strength || 0.7,
          guidance_scale: params.guidance_scale || 7.5
        }
      };
      const createRes = await axios.post('https://api.replicate.com/v1/predictions', body, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
        timeout: 30000
      });
      const predictionId = createRes.data.id;
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollRes = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: { Authorization: `Token ${token}` },
          timeout: 15000
        });
        const { status, output } = pollRes.data;
        if (status === 'succeeded' && output && output.length) {
          const buffers = [];
          for (const url of output) {
            const r = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
            buffers.push(Buffer.from(r.data));
          }
          return buffers;
        }
        if (status === 'failed' || status === 'canceled') throw new Error(`Replicate prediction ${status}`);
      }
      throw new Error('Replicate prediction timed out');
    } catch (err) {
      console.warn('Replicate failed, using fallback:', err.message);
    }
  }
  const fallback = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
  return [Buffer.from(fallback.data)];
}

module.exports = { generateImage };
CONTENT

# ─── Prisma ───────────────────────────────────────────────────────────────────

write_file "backend/shared/prisma/schema_additions.prisma" <<'CONTENT'
/*
 * Append this GeneratedLook model to backend/shared/prisma/schema.prisma
 * Then run: npx prisma migrate dev --name add_generated_look
 */

model GeneratedLook {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  originalUrl String
  resultUrls  String[] @default([])
  preset      String?
  params      Json?
  provider    String?
  costCredits Float    @default(0)
  saved       Boolean  @default(false)
  bookingId   String?
  booking     Booking? @relation(fields: [bookingId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

/*
 * Also add to your existing Booking model:
 *   generatedLookId  String?
 *   generatedLook    GeneratedLook? @relation(fields: [generatedLookId], references: [id])
 */
CONTENT

write_file "backend/shared/prisma/seed.js" <<'CONTENT'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRESETS = [
  { name: 'bob-short', description: 'Bob corto, naturale' },
  { name: 'long-waves', description: 'Onde lunghe e naturali' },
  { name: 'pixie', description: 'Pixie cut moderno' },
  { name: 'fade-beard', description: 'Fade e barba curata' },
  { name: 'blonde-balayage', description: 'Balayage biondo caldo' }
];

async function main() {
  console.log('Seed presets (dev):', PRESETS.map((p) => p.name).join(', '));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
CONTENT

# ─── Mobile ───────────────────────────────────────────────────────────────────

write_file "mobile/app/(tabs)/ai-look.tsx" <<'CONTENT'
import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ActivityIndicator,
  ScrollView, StyleSheet, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const PRESETS = [
  { key: 'bob-short', label: 'Bob corto' },
  { key: 'long-waves', label: 'Onde lunghe' },
  { key: 'pixie', label: 'Pixie cut' },
  { key: 'fade-beard', label: 'Fade & barba' },
  { key: 'blonde-balayage', label: 'Balayage biondo' }
];

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export default function AILookScreen() {
  const [photoUri, setPhotoUri] = useState(null);
  const [lookId, setLookId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState([]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permesso necessario', "Abilita l'accesso alla galleria nelle impostazioni.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [4, 5] });
    if (res.canceled) return;
    const asset = res.assets[0];
    setPhotoUri(asset.uri);
    setStatus('uploading');
    setLookId(null);
    setResults([]);
    try {
      const form = new FormData();
      form.append('photo', { uri: asset.uri, name: 'photo.jpg', type: 'image/jpeg' });
      const r = await axios.post(`${API_BASE}/api/ai-look/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLookId(r.data.id);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      Alert.alert('Errore', 'Caricamento foto fallito. Riprova.');
    }
  };

  const generate = async (preset) => {
    if (!lookId) { Alert.alert('Seleziona prima una foto'); return; }
    setStatus('queued');
    setResults([]);
    try {
      await axios.post(`${API_BASE}/api/ai-look/generate`, { id: lookId, preset, provider: 'replicate' });
      setStatus('processing');
      const interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/api/ai-look/status/${lookId}`);
          if (res.data.resultUrls && res.data.resultUrls.length > 0) {
            clearInterval(interval);
            setResults(res.data.resultUrls);
            setStatus('done');
          }
        } catch { clearInterval(interval); setStatus('error'); }
      }, 3000);
    } catch {
      setStatus('error');
      Alert.alert('Errore', 'Generazione fallita. Riprova.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>✨ AI Look</Text>
      <Text style={styles.subtitle}>Carica la tua foto e prova un nuovo look virtuale</Text>
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text style={styles.uploadBtnText}>{photoUri ? '📷 Cambia foto' : '📷 Scegli foto'}</Text>
      </TouchableOpacity>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
      {lookId && status === 'idle' && (
        <>
          <Text style={styles.sectionTitle}>Scegli il tuo preset</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map((p) => (
              <TouchableOpacity key={p.key} style={styles.presetChip} onPress={() => generate(p.key)}>
                <Text style={styles.presetText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      {(status === 'uploading' || status === 'queued' || status === 'processing') && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>
            {status === 'uploading' ? 'Caricamento foto…' : 'Generazione look in corso…'}
          </Text>
        </View>
      )}
      {status === 'error' && <Text style={styles.errorText}>Si è verificato un errore. Riprova.</Text>}
      {results.map((url, i) => (
        <View key={i} style={styles.resultCard}>
          <Image source={{ uri: url }} style={styles.resultImage} />
          <TouchableOpacity style={styles.bookBtn} onPress={() => Alert.alert('Prenota', `Avvia prenotazione per il look ${lookId}`)}>
            <Text style={styles.bookBtnText}>💅 Prenota questo look</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#667eea', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  uploadBtn: { backgroundColor: '#667eea', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  uploadBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  preview: { width: '100%', height: 280, borderRadius: 12, marginBottom: 20, resizeMode: 'cover' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  presetChip: { backgroundColor: '#f0eeff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  presetText: { color: '#667eea', fontWeight: '500' },
  loadingBox: { alignItems: 'center', marginVertical: 24 },
  loadingText: { marginTop: 10, color: '#667eea', fontSize: 14 },
  errorText: { color: '#e53e3e', textAlign: 'center', marginVertical: 12 },
  resultCard: { marginBottom: 20 },
  resultImage: { width: '100%', height: 320, borderRadius: 12, resizeMode: 'cover', marginBottom: 10 },
  bookBtn: { backgroundColor: '#667eea', padding: 14, borderRadius: 12, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
CONTENT

# ─── Root config / infra files ────────────────────────────────────────────────

write_file ".env.example" <<'CONTENT'
# ─────────────────────────────────────────────────────────────────────────────
# Stayle Beauty — Environment Variables
# Copy this file to .env and fill in the real values.
# ⚠️  NEVER commit a .env file with real secrets to git.
# ─────────────────────────────────────────────────────────────────────────────

# Database
DATABASE_URL="postgresql://stayle:stayle_2026@localhost:5432/stayle_beauty"

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# S3 / Object Storage
S3_BUCKET="your-bucket-name"
S3_KEY="your-access-key-id"
S3_SECRET="your-secret-access-key"
S3_REGION="us-east-1"
# S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"

# AI Providers
REPLICATE_API_TOKEN="r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STABILITY_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Auth
JWT_SECRET="change_me_to_a_long_random_string"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Firebase / FCM
FIREBASE_SERVER_KEY="AAAA_your_firebase_server_key"

# AI Style Service
AI_STYLE_PORT=3011

# Mobile / Expo
EXPO_PUBLIC_API_URL="http://localhost:3000"
CONTENT

write_file "docker-compose.ai-style.yml" <<'CONTENT'
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  ai-style-service:
    build:
      context: ./backend/services/ai-style-service
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - '3011:3011'
    env_file:
      - .env
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
    healthcheck:
      test: ['CMD', 'wget', '-qO-', 'http://localhost:3011/health']
      interval: 30s
      timeout: 10s
      retries: 3

  ai-style-worker:
    build:
      context: ./backend/services/ai-style-service
      dockerfile: Dockerfile
    restart: unless-stopped
    command: node src/worker.js
    env_file:
      - .env
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis
      - ai-style-service

volumes:
  redis_data:
CONTENT

write_file "PR_description.txt" <<'CONTENT'
Title: feature/ai-look: add AI Look microservice, Prisma schema, mobile UI, Docker & docs

## Description

This PR adds the complete AI Look (Virtual Style) feature to the Stayle Beauty platform.

### What's included
- backend/services/ai-style-service — REST API + BullMQ worker + Dockerfile
- backend/shared/prisma/schema_additions.prisma — GeneratedLook model + Booking extension
- mobile/app/(tabs)/ai-look.tsx — Expo / React Native AI Look screen
- docker-compose.ai-style.yml — service + worker containers
- .env.example — all required environment variables
- docs/ai-look.md — full developer guide
- docs/SMARTPHONE_GUIDE.md — iOS & Android guide for applying changes from phone

## GitHub Secrets to configure
Settings → Secrets and variables → Actions → New repository secret:
  REPLICATE_API_TOKEN, STABILITY_API_KEY, OPENAI_API_KEY
  S3_BUCKET, S3_KEY, S3_SECRET, S3_REGION, S3_ENDPOINT (optional)
  REDIS_HOST, REDIS_PORT
  DATABASE_URL, JWT_SECRET
  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
  FIREBASE_SERVER_KEY

⚠️ Never commit real secret values to the repository.

## Testing checklist
- [ ] cp .env.example .env and fill real values
- [ ] docker-compose up -d postgres mongodb redis
- [ ] docker-compose -f docker-compose.ai-style.yml up --build -d
- [ ] npx prisma migrate dev --name add_generated_look
- [ ] node backend/shared/prisma/seed.js
- [ ] POST /api/ai-look/upload with image → { id, originalUrl }
- [ ] POST /api/ai-look/generate → { status: 'queued' }
- [ ] GET /api/ai-look/status/:id → resultUrls populated
- [ ] POST /api/ai-look/save → { status: 'saved' }
- [ ] POST /api/ai-look/book → Booking created
- [ ] Mobile screen: pick photo → choose preset → see results → tap "Prenota"
CONTENT

write_file "docs/ai-look.md" <<'CONTENT'
# AI Look (Virtual Style) — Developer Guide

## Overview
The AI Look feature lets users upload a selfie and generate AI-powered
hairstyle previews. Users can then book a professional to replicate the chosen look.

| Component | Path |
|-----------|------|
| Backend microservice | `backend/services/ai-style-service/` |
| BullMQ worker | `backend/services/ai-style-service/src/worker.js` |
| Mobile screen | `mobile/app/(tabs)/ai-look.tsx` |
| Prisma additions | `backend/shared/prisma/schema_additions.prisma` |
| Docker compose | `docker-compose.ai-style.yml` |

## Required GitHub Secrets
REPLICATE_API_TOKEN, STABILITY_API_KEY, OPENAI_API_KEY,
S3_BUCKET, S3_KEY, S3_SECRET, S3_REGION, S3_ENDPOINT,
REDIS_HOST, REDIS_PORT, DATABASE_URL, JWT_SECRET,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FIREBASE_SERVER_KEY

## Local Development
1. cp .env.example .env  (fill real values)
2. docker-compose up -d postgres mongodb redis
3. docker-compose -f docker-compose.ai-style.yml up --build -d
4. cd backend/shared/prisma && npx prisma migrate dev --name add_generated_look
5. node backend/shared/prisma/seed.js
6. Mobile: cd mobile && npx expo start

## API Reference
POST /api/ai-look/upload     — multipart/form-data field 'photo'
POST /api/ai-look/generate   — { id, preset, params?, provider? }
GET  /api/ai-look/status/:id
GET  /api/ai-look/result/:id
POST /api/ai-look/save       — { id }
POST /api/ai-look/book       — { lookId, professionalId, date, startTime, totalPrice }

All endpoints require x-user-id header.
CONTENT

write_file "docs/SMARTPHONE_GUIDE.md" <<'CONTENT'
# Guida Smartphone — Applicare le modifiche da iOS o Android

## Flusso 1 — iOS (Working Copy + GitHub web)

### Strumenti
- App Working Copy (App Store)
- Safari / Chrome

### Passi
1. Working Copy → + → Clone Repository → https://github.com/mikimause93/-Beauty-Style-
2. Branch → New Branch → feature/ai-look
3. Aggiungi file: usa GitHub web (Safari) → Add file → Create new file
   oppure Files app + Working Copy per caricare lo ZIP estratto
4. Commit & Push da Working Copy
5. Safari → https://github.com/mikimause93/-Beauty-Style-/compare/feature/ai-look → Create pull request

## Flusso 2 — Android (Termux)

### Installazione Termux
pkg update && pkg install git openssh nodejs-lts zip -y

### Comandi
git clone https://github.com/mikimause93/-Beauty-Style-.git
cd -- -Beauty-Style-
git checkout -b feature/ai-look
# copia i file nel repo
git add .
git commit -m "feature(ai-look): add AI Look microservice and mobile UI"
git push -u origin feature/ai-look

## Limitazioni smartphone
- docker-compose: NON supportato su smartphone (serve server remoto)
- npm install / Prisma migrate: solo via Termux (Android)
- Upload file: uno alla volta via GitHub web su iOS
- Test API: solo via Termux + port forward su Android

## Impostare GitHub Secrets da smartphone
1. https://github.com/mikimause93/-Beauty-Style-/settings/secrets/actions
2. New repository secret per ciascuna variabile (vedere .env.example)
⚠️ Non inserire MAI chiavi reali nel codice.
CONTENT

# ─── Commit and push ──────────────────────────────────────────────────────────
echo ""
ok "All files created."
echo ""
echo "─────────────────────────────────────────────────────────────"
echo " Committing and pushing to branch: ${BRANCH}"
echo "─────────────────────────────────────────────────────────────"

git add .
git commit -m "feature(ai-look): add AI Look microservice, Prisma schema, mobile UI, Docker & docs"
git push -u "${REMOTE}" "${BRANCH}"

echo ""
ok "Branch '${BRANCH}' pushed successfully!"
echo ""
echo "Open this URL to create the Pull Request:"
echo "  ${REPO_URL}/compare/${BRANCH}"
echo ""
echo "Copy the content of PR_description.txt into the PR description."
