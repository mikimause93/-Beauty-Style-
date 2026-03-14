## Description

<!-- Describe your changes and the motivation behind them -->

## Type of change

- [ ] New feature
- [ ] Bug fix
- [ ] Refactor / improvement
- [ ] Documentation update
- [ ] Chore / dependency update

## Checklist

- [ ] Secrets configured in GitHub (Settings → Secrets → Actions) — see `.env.example` for the full list
- [ ] `docker-compose up -d postgres mongodb redis` — infrastructure running locally
- [ ] `docker-compose -f docker-compose.ai-style.yml up --build -d` — AI service + worker running
- [ ] `npx prisma migrate dev --name add_generated_look` — DB migration applied
- [ ] `node backend/shared/prisma/seed.js` — seed presets logged without error
- [ ] `POST /api/ai-look/upload` with a test image returns `{ id, originalUrl }`
- [ ] `POST /api/ai-look/generate` returns `{ status: "queued", id }`
- [ ] Worker processes job — `GET /api/ai-look/result/:id` returns non-empty `resultUrls`
- [ ] `POST /api/ai-look/save` returns `{ status: "saved" }`
- [ ] `POST /api/ai-look/book` creates a booking and links it to the look
- [ ] Mobile screen (`mobile/app/(tabs)/ai-look.tsx`) builds without TypeScript errors
- [ ] Health endpoint `GET /health` returns `{ status: "ok" }`
- [ ] No secrets committed to the repository

## Related issues

<!-- Closes # -->

## Screenshots / recordings (if applicable)

<!-- Add screenshots or screen recordings of the UI changes -->
