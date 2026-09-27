# TripSync AI — project context

## Product
TripSync AI is a **group trip decision-support tool**. A group of friends can't agree on a trip (different schedules,
budgets, preferences — e.g. 5 friends, 3 months, 1,200 WhatsApp messages, 0 plans). The coordinator (persona: **Riya**)
creates a trip, shares a link, everyone submits structured preferences, and Gemini proposes **2–3 balanced destination
options** with trade-offs and a per-person fit score.

**Core flow (the whole MVP):** create trip → share link → collect preferences → store in Supabase → analyze group with
Gemini → show 2–3 options with group fit, strengths, trade-offs, and individual fit + compromises.

**The AI is decision support, not the decision-maker.** Never label an option "best"/"winner". The group decides.

### Pages
| Route | Purpose |
|---|---|
| `/` | Landing. CTAs: "Create a Trip" (primary), "Join a Trip" (secondary) |
| `/create` | Trip name, coordinator name, # travellers, currency, optional friend names |
| `/join` | Paste link or trip code → redirects to `/trip/[id]/join` |
| `/trip/[id]` | Coordinator dashboard: X of Y responses, submitted / pending names, group snapshot, share link, "Analyze Trip Options" |
| `/trip/[id]/join` | **The shareable URL.** Preference form (name, budget, dates, destination types, trip styles, must-haves, avoid, flexibility) |
| `/trip/[id]/results` | "Your Group's Trip Options": summary, insights, where group agrees / has trade-offs, 2–3 option cards with per-person fit bars |

### API routes (all server-side)
- `POST /api/trips` → create trip + coordinator (+ optional named friends) → `{ id }`
- `POST /api/trips/[id]/responses` → upsert a participant (matched by case-insensitive name) and their preferences
- `POST /api/trips/[id]/analyze` → run Gemini on all submitted responses, save to `analyses`, → `{ id }`

Analysis works with **any number of responses ≥ 1** — it does not wait for everyone; the UI states "based on X of Y".

## Stack
- Next.js 15 (App Router, TypeScript) + React 19
- Tailwind CSS 3 (shared component classes in `app/globals.css`: `.btn-primary`, `.card`, `.input`, …)
- Supabase (Postgres) via `@supabase/supabase-js` — **server-side only**, service_role key
- Gemini via REST (`generativelanguage.googleapis.com/v1beta`, `generateContent` with `responseSchema` JSON mode). No SDK.
- Deploy target: Vercel. Analyze route sets `maxDuration = 60`.

## Code map
- `lib/types.ts` — DB row types + `AnalysisResult` (the JSON shape stored in `analyses.result`)
- `lib/constants.ts` — destination types, trip styles, flexibility, currencies
- `lib/validation.ts` — request body parsing/validation (throws `ValidationError` → 400)
- `lib/db.ts` — all Supabase queries (server-only)
- `lib/groupFacts.ts` — deterministic stats (budget range, common date window, vote tallies). Used by dashboard and fed to the AI as grounding.
- `lib/analysis.ts` — system prompt, Gemini response schema, prompt builder, output normalization (guarantees every participant appears in every option, clamps scores, 1 retry)
- `lib/gemini.ts` — minimal Gemini REST client
- `lib/pageData.ts` — page loader that turns missing env vars into `<SetupNotice>`
- `supabase/schema.sql` — tables: `trips`, `participants`, `preferences` (1:1 with participant), `analyses`

## Data model
`trips (id text PK short code)` 1—* `participants (unique trip_id+lower(name))` 1—1 `preferences`;
`trips` 1—* `analyses (result jsonb)` — latest analysis is displayed; older ones are kept.

## Important rules
- **Never hardcode secrets.** Only read them from `process.env`. `.env*` files are git-ignored (except `.env.example`).
- Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, optional `GEMINI_MODEL` (default `gemini-3.8-flash`; `gemini-2.5-flash` now returns 404 for new API users).
- Any module touching secrets must `import "server-only"`. Never prefix secrets with `NEXT_PUBLIC_`.
- RLS is enabled on all tables with **no policies** — the browser never talks to Supabase directly.
- Next.js 15: `params` / `searchParams` are Promises — `await` them.
- Keep it an MVP. **Do not add:** authentication, payments, flight/hotel booking, maps, email invitations, complex voting, extra third-party APIs.
- Keep code beginner-friendly: simple components, no state libraries, no ORMs.
- Design: clean modern consumer SaaS — Inter, slate neutrals, indigo primary, cards, progress bars; fit colours: emerald ≥75, amber 55–74, rose <55. No heavy animation.

## Commands
- `npm install` · `npm run dev` · `npm run build` · `npm run typecheck`

## Known limitations / ideas
- No auth: anyone with the trip link can view the dashboard and submit/overwrite a response under any name (by design for the MVP).
- No rate limiting on the analyze endpoint (each call costs a Gemini request).
