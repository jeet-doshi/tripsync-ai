# TripSync AI

Turn everyone's travel preferences into a clear group trip decision.

Create a trip → share the link → everyone submits budget, dates & preferences → Gemini suggests 2–3 balanced
destinations with trade-offs and a fit score for every person. The group makes the final call.

**Stack:** Next.js 15 · React 19 · Tailwind CSS · Supabase · Gemini API · Vercel

## Setup

### 1. Install
Requires Node.js 18.18+ (20 LTS recommended).

```bash
npm install
```

### 2. Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. Go to **Project Settings → API** and copy the **Project URL** and the **service_role** key.

### 3. Gemini
Create an API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 4. Environment variables
Copy `.env.example` to `.env.local` and fill it in:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.8-flash   # optional
```

`.env.local` is git-ignored — never commit it.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Testing the flow locally
1. **Create a Trip** as "Riya" with 5 travellers (optionally list friends: `Arjun, Meera, Kabir, Zoya`).
2. Copy the invite link from the dashboard. Open it (a private window works well) and submit preferences as 2–3
   different people with different budgets, dates and styles.
3. Back on the dashboard, click **Refresh** — you'll see "3 of 5 received" and who's pending.
4. Click **Analyze Trip Options** → you land on **Your Group's Trip Options**.

## Deploying to Vercel
1. Push to GitHub (secrets are excluded by `.gitignore`).
2. Import the repo in Vercel.
3. Add the same environment variables under **Project → Settings → Environment Variables**.
4. Deploy.
