# InterviewPrep AI

An AI mock-interview coach. Upload a resume or job description photo, get tailored
interview questions from Groq AI, practice, get scored, and track your readiness
over time on an analytics dashboard.

## Stack

- **Frontend**: React (Vite, JSX) + Tailwind CSS + Recharts + React Router
- **Backend**: Node.js + Express (keeps Groq/Resend API keys server-side)
- **Auth & DB**: Supabase (Postgres + Auth + Row Level Security)
- **AI**: Groq AI (chat) for question generation & feedback, Groq Vision for
  reading resume/JD photos
- **Email**: Resend for practice reminders / weekly digest

## Project structure

```
interviewprep-ai/
  frontend/     # React app (Vite)
  backend/      # Express API (Groq + Resend proxy)
  supabase/     # schema.sql to run in Supabase SQL editor
```

## 1. Supabase setup

1. Create a project at https://supabase.com.
2. Open the SQL editor, paste the contents of `supabase/schema.sql`, and run it.
   This creates all tables + Row Level Security policies.
3. Go to Project Settings → API and copy:
   - Project URL
   - anon public key

## 2. Groq setup

1. Create an API key at https://console.groq.com.
2. Groq's API is OpenAI-compatible and includes vision-capable models, used here
   for both question generation (text) and resume/JD photo reading (vision).

## 3. Resend setup

1. Create an API key at https://resend.com.
2. Verify a sending domain (or use Resend's test domain while developing).

## 4. Backend setup (run in VS Code terminal)

```bash
cd backend
cp .env.example .env
# fill in GROQ_API_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL, PORT
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

## 5. Frontend setup

```bash
cd frontend
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 6. Using the app

1. Sign up (Supabase Auth creates the user + a `profiles` row via trigger).
2. Create an "Interview Set" (e.g. "Frontend Engineer @ Acme").
3. Upload a resume/JD photo or paste text → Groq generates questions.
4. Practice: answer questions, get AI feedback + a score.
5. Check the Dashboard for accuracy trend, streaks, and topic mastery.
6. (Optional) Trigger "Send me a reminder" to test the Resend email route.

## 7. Deployment

- **Frontend**: deploy `frontend/` to Vercel or Netlify. Set the same env vars
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` pointing at your
  deployed backend URL).
- **Backend**: deploy `backend/` to Render, Railway, or Fly.io. Set `GROQ_API_KEY`,
  `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CORS_ORIGIN` (your deployed frontend URL).
- Push the whole `interviewprep-ai/` folder to a GitHub repo, then connect that
  repo to your hosting provider for CI deploys.

## 8. GitHub

```bash
cd interviewprep-ai
git init
git add .
git commit -m "Initial commit: InterviewPrep AI"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Make sure `.env` files are in `.gitignore` (already included) so keys are never committed.
