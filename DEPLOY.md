# Deploying MedScribe

Two pieces: the **FastAPI backend** on Railway and the **Next.js frontend** on
Vercel. Do the backend first — you need its public URL to configure the frontend.

## Prerequisites
- The code pushed to GitHub (it already is: `jwsearle18/medscribe`).
- Your four secrets ready: `DEEPGRAM_API_KEY`, `ANTHROPIC_API_KEY`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY` (same values as in `backend/.env`).
- Supabase schema applied (`backend/schema.sql`) and demo data seeded
  (`poetry run python backend/seed_demo.py`).

## 1. Backend → Railway
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pick `medscribe`.
2. Open the created service → **Settings**:
   - **Root Directory**: `backend`  ← important, so it builds only the backend.
   - Railway auto-detects Python from `requirements.txt` and uses the `Procfile`
     start command (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
3. **Variables** tab → add all four:
   - `DEEPGRAM_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Settings → Networking → Generate Domain**. Copy the public URL
   (e.g. `https://medscribe-production.up.railway.app`).
5. Confirm it's live: open `https://<that-url>/` — you should see
   `{"message":"This is the root"}`.

## 2. Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New… → Project** → import `medscribe`.
2. **Root Directory**: `frontend`. Framework preset auto-detects **Next.js**.
3. **Environment Variables** → add:
   - `NEXT_PUBLIC_BACKEND_URL` = the Railway URL from step 1.4 (no trailing slash).
4. **Deploy**. When it finishes, open the Vercel URL.

## 3. Verify end to end
- On the deployed site, click the **DEMO-1001** link (or search that patient ID)
  → the completed note and PDF download should work (proves frontend → Railway →
  Supabase → PDF).
- Click **"Load a sample conversation"** → Save → generate the note (proves the
  Anthropic path) — no microphone needed.

## Notes
- CORS is already wide open (`allow_origins=["*"]`) in `backend/app/main.py`.
- If you change `NEXT_PUBLIC_BACKEND_URL` later, redeploy the frontend — Next.js
  inlines `NEXT_PUBLIC_*` values at build time.
- `.env` files are gitignored; set secrets in each platform's dashboard, never in code.
