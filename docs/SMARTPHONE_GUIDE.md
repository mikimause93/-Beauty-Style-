# Guida Smartphone — Applicare le modifiche da iOS o Android

Questa guida ti spiega come caricare i file del pacchetto AI Look direttamente
da smartphone, usando due flussi principali.

---

## Contenuto del pacchetto

| File | Percorso nel repo |
|------|-------------------|
| Microservice API | `backend/services/ai-style-service/` |
| Worker BullMQ | `backend/services/ai-style-service/src/worker.js` |
| Mobile screen | `mobile/app/(tabs)/ai-look.tsx` |
| Prisma schema | `backend/shared/prisma/schema_additions.prisma` |
| Docker compose | `docker-compose.ai-style.yml` |
| Env example | `.env.example` |
| Documentazione | `docs/ai-look.md` |
| PR description | `PR_description.txt` |

---

## Flusso 1 — iOS (Working Copy + GitHub web)

### Strumenti necessari
- App **Working Copy** (gratuita con unlock opzionale) — App Store
- Browser Safari o Chrome su iPhone/iPad
- Account GitHub

### Passo a passo

#### A) Clonare il repository
1. Apri **Working Copy** → tocca il `+` in alto a destra.
2. Scegli **Clone Repository**.
3. Inserisci l'URL: `https://github.com/mikimause93/-Beauty-Style-`
4. Tocca **Clone** e aspetta il completamento.

#### B) Creare il branch feature/ai-look
1. In Working Copy, tocca il nome del repository.
2. Tocca **Branch** → **New Branch**.
3. Digita `feature/ai-look` → **Create**.

#### C) Aggiungere i file
**Opzione 1 — App Files (iOS):**
1. Scarica lo ZIP del pacchetto (`apply-all.sh` genera `stayle-ai-look-package.zip`
   su un Mac/PC — vedi sezione [One-Click Script](#one-click-script)).
2. Estrai lo ZIP con l'app **Files** di iOS.
3. Copia le cartelle estratte nel repository clonato tramite Working Copy
   (tocca e tieni premuto → Sposta / Copia).

**Opzione 2 — GitHub web (file per file):**
1. Apri `https://github.com/mikimause93/-Beauty-Style-/tree/feature/ai-look`
   su Safari.
2. Naviga nella cartella desiderata.
3. Tocca **Add file → Create new file** o **Upload files**.
4. Incolla il contenuto copiando dal file sorgente del pacchetto.

#### D) Commit e push
1. Torna in Working Copy → tocca il nome del repo.
2. Tocca **Commit** in basso.
3. Scrivi il messaggio: `feature(ai-look): add AI Look microservice and mobile UI`
4. Tocca **Commit & Push**.

#### E) Aprire la Pull Request
1. Apri Safari → `https://github.com/mikimause93/-Beauty-Style-/compare/feature/ai-look`
2. Tocca **Create pull request**.
3. Copia il contenuto di `PR_description.txt` nella descrizione.
4. Tocca **Create pull request**.

---

## Flusso 2 — Android (Termux o GitHub web)

### Opzione A: Termux (più completo)

#### Installazione
1. Installa **Termux** da F-Droid (consigliato) o Play Store.
2. Apri Termux ed esegui:
   ```bash
   pkg update && pkg install git openssh nodejs-lts zip -y
   ```

#### Clone e branch
```bash
git clone https://github.com/mikimause93/-Beauty-Style-.git
cd -- -Beauty-Style-
git checkout -b feature/ai-look
```

#### Applicare il pacchetto (one-click)
```bash
# Scarica e lancia lo script di setup (se disponibile online)
# Oppure crea manualmente i file seguendo la struttura del pacchetto

# Esempio: crea la struttura base
mkdir -p backend/services/ai-style-service/src/{routes,lib}
mkdir -p backend/shared/prisma
mkdir -p mobile/app/\(tabs\)
mkdir -p docs
```

#### Commit e push
```bash
git add .
git commit -m "feature(ai-look): add AI Look microservice and mobile UI"
git push -u origin feature/ai-look
```

### Opzione B: GitHub web su Android
1. Apri Chrome → `https://github.com/mikimause93/-Beauty-Style-`
2. Tocca il menu **hamburger** (≡) → **Switch branches** → digita `feature/ai-look` → **Create**.
3. Naviga nelle cartelle e usa **Add file → Create new file** per aggiungere i file
   uno alla volta, incollando il contenuto dal pacchetto.

---

## Limitazioni da smartphone

| Operazione | iOS | Android |
|------------|-----|---------|
| Clone repo | ✅ Working Copy | ✅ Termux |
| Crea branch | ✅ Working Copy | ✅ Termux / web |
| Carica file | ⚠️ Uno alla volta via web | ✅ Termux (batch) |
| Esegui `npm install` | ❌ Non supportato | ✅ Termux |
| Esegui `docker-compose` | ❌ | ❌ (serve server remoto) |
| Esegui migrazione Prisma | ❌ | ⚠️ Solo via Termux se DB accessibile |
| Test API locali | ❌ | ⚠️ Solo via Termux + port forward |
| Apri PR | ✅ GitHub web | ✅ GitHub web |

> **Consiglio**: Per il deploy completo e i test, usa sempre un computer o un
> server remoto (es. VPS, Railway, Render). Lo smartphone è utile per caricare
> file ed aprire PR, non per eseguire build/test.

---

## Impostare i GitHub Secrets da smartphone

1. Apri `https://github.com/mikimause93/-Beauty-Style-/settings/secrets/actions`
   su Safari / Chrome mobile.
2. Tocca **New repository secret**.
3. Aggiungi un secret alla volta:

   | Nome | Descrizione |
   |------|-------------|
   | `REPLICATE_API_TOKEN` | Token API Replicate |
   | `OPENAI_API_KEY` | Chiave OpenAI (opzionale) |
   | `S3_BUCKET` | Nome bucket S3 |
   | `S3_KEY` | Access key ID S3 |
   | `S3_SECRET` | Secret access key S3 |
   | `S3_REGION` | Regione S3 |
   | `DATABASE_URL` | URL PostgreSQL |
   | `REDIS_HOST` | Host Redis |
   | `REDIS_PORT` | Porta Redis |
   | `JWT_SECRET` | Segreto JWT |
   | `STRIPE_SECRET_KEY` | Chiave segreta Stripe |
   | `STRIPE_WEBHOOK_SECRET` | Segreto webhook Stripe |
   | `FIREBASE_SERVER_KEY` | Chiave server Firebase FCM |

4. Tocca **Add secret** per ciascuno.

> ⚠️ Non inserire MAI le chiavi reali direttamente nel codice o nei file
> versionati. Usa solo i GitHub Secrets o variabili d'ambiente locali non
> commitmate.

---

## One-Click Script

Esegui `apply-all.sh` su un Mac/Linux/PC Windows (con Git Bash) per applicare
tutte le modifiche in un unico passaggio:

```bash
chmod +x apply-all.sh
./apply-all.sh
```

Lo script:
1. Crea il branch `feature/ai-look`
2. Crea tutti i file necessari
3. Esegue `git add . && git commit && git push`
4. Stampa il link per aprire la PR su GitHub
