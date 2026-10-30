# Aura Engine

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Faviral10x%2Ftheauraengine&project-name=theauraengine&env=AUTH_SECRET,ANTHROPIC_API_KEY,HF_API_KEY_ID,HF_API_KEY_SECRET&envDescription=See%20.env.example&envLink=https%3A%2F%2Fgithub.com%2Faviral10x%2Ftheauraengine%2Fblob%2Fmain%2F.env.example&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22neon%22%2C%22productSlug%22%3A%22neon%22%2C%22protocol%22%3A%22storage%22%7D%2C%7B%22type%22%3A%22blob%22%2C%22access%22%3A%22public%22%7D%5D)

**Paste your URL. Get a series, not an ad.**
The AI video engine from InkFrame Films (the studio behind @aurakidzzz: 550K followers and 700M+ organic views). It turns a brand's website into micro-dramas, character series and launch films, using the formats the team proved organically, with distribution and an InkFrame studio handoff built in.

## What's in here

| Area | What it does |
|---|---|
| **Landing site** (`/`) | Positioning, proof (Aura episodes), format library, how it works, distribution, studio, pricing, FAQ, free scan CTA |
| **Free scan** (`/api/scan`) | SSRF-safe crawl of up to 5 pages → Claude builds **Brand DNA + Story DNA + compliance guardrails + format ranking + 3 series concepts**. Works without signup (3/day/IP) |
| **Studio workspace** (`/p/[id]`) | 1. DNA → 2. Formats & concepts → 3. Season bible + cast → Episodes (shot lists → storyboard frames → video → stitched MP4) → Publish & distribute |
| **Generation** | Higgsfield API: character sheets + storyboard frames (Grok Imagine 2.0 with character/product references), image-to-video per shot (Kling 3.0 Turbo / Std / Pro, native audio). Webhooks (Standard Webhooks signatures) + polling fallback. Outputs archived to S3/R2 (Higgsfield deletes after 7 days) |
| **Final cut** | ffmpeg normalizes every clip (size, fps, audio/silence) and concatenates into one MP4 |
| **Credits** | Atomic ledger; charge on submit, automatic refund on failure/moderation; costs shown on every button |
| **Billing** (`/app/billing`) | Stripe Checkout subscriptions (Creator $39 / Brand $199) + credit top-ups; webhook grants credits idempotently |
| **Leads** | "Send to InkFrame" + "Boost on the Aura Network" forms → DB (+ optional Slack/Zapier webhook) → `/app/admin` |
| **Auth** | Email + password (bcrypt), signed httpOnly JWT cookie; anonymous scans are claimed on signup |

The Aura Format Library lives in `src/lib/formats.ts`: Character Chaos, Micro-Drama Season, Animated Brand Spot, Cinematic Launch Film, Explainer Skit, Trend Remix. It's fed verbatim to Claude, so **edit it to encode more of your playbook** (hooks, pacing, retention learnings from your own posts).

## Run locally

```bash
npm install
docker compose up -d          # local Postgres on :5432 (or use any Postgres URL)
cp .env.example .env          # set AUTH_SECRET at minimum for `npm start`
npx prisma migrate deploy     # creates the tables
npm run dev                   # http://localhost:3000
```

With no API keys, the app runs in **demo mode**: scans and scripts are derived from the crawl, and frames are placeholders, so you can click through the whole flow. Add keys one at a time to switch each part to real output.

Make yourself an admin by putting your email in `ADMIN_EMAILS`.

## API keys / accounts needed

| Variable | Where to get it | Required for |
|---|---|---|
| `ANTHROPIC_API_KEY` | platform.claude.com → API keys | Real Brand/Story DNA, concepts, series bibles, shot lists (model: `claude-sonnet-5-5`, override with `CLAUDE_MODEL`) |
| `HF_API_KEY_ID` + `HF_API_KEY_SECRET` | console.higgsfield.ai → API keys (prepaid USD balance, $5 min) | Character sheets, storyboards, video |
| `HF_WEBHOOK_SECRET` | Higgsfield console → Settings → webhook signing secret (`whsec_…`) | Instant completion via webhooks (polling works without it) |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | dashboard.stripe.com → Developers | Subscriptions + top-ups. Webhook endpoint: `/api/webhooks/stripe`, events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted` |
| `BLOB_READ_WRITE_TOKEN` *(or `S3_*`)* | Vercel → Storage → Blob (public), auto-injected | Permanent storage of frames/videos/final cuts (**required in production**) |
| `DATABASE_URL` + `DATABASE_URL_UNPOOLED` | Vercel → Storage → Neon, auto-injected | Production database |
| `AUTH_SECRET` | `openssl rand -base64 48` | Session signing (**required in production**) |
| `LEADS_WEBHOOK_URL` *(optional)* | Slack incoming webhook / Zapier | Pinging the team on studio + distribution leads |

## Deploy to Vercel

**One click:** use the Deploy button above. It creates the project, provisions **Neon Postgres** + a **public Blob store**, and asks for the keys.

**Or manually:**
1. vercel.com → Add New → Project → import `aviral10x/theauraengine` (framework: Next.js, defaults are fine).
2. Project → **Storage** → connect **Neon** (Postgres) and **Blob** (access: *public*). These inject `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and the Blob credentials.
3. Project → Settings → **Environment Variables**: `AUTH_SECRET` (required), `ANTHROPIC_API_KEY`, `HF_API_KEY_ID`, `HF_API_KEY_SECRET`, `HF_WEBHOOK_SECRET`, `ADMIN_EMAILS`, and optionally the Stripe keys.
4. Deploy. The build runs `prisma migrate deploy`, so tables are created automatically.
5. After the first deploy: in the Higgsfield console set the webhook signing secret; in Stripe add the endpoint `https://<your-domain>/api/webhooks/stripe`.

Notes: `APP_URL` defaults to the Vercel production domain. Scans and scripts can take up to 300s (`maxDuration`), which Vercel supports with Fluid compute. `ffmpeg-static` is bundled into the stitch function automatically.

## Unit economics (defaults in `src/lib/credits.ts`)

1 credit ≈ $0.10 retail. Series bible 3 cr · episode script 1 cr · character sheet 2 cr · frame 1 cr · video 1/2/4 cr per second (Turbo/Std/Pro). On Higgsfield list prices (e.g. Kling 3.0 ≈ $1.12 per 10s) this keeps blended gross margin healthy; adjust once you see real costs in the Higgsfield console.

## Architecture

```
src/
  app/                    pages + route handlers (Next.js 16 App Router)
    api/scan              crawl → Claude scan → Project
    api/projects/[id]/…   series, characters, episodes/[n]/{script,frames,render,stitch}, shots/[shotId]
    api/webhooks/…        higgsfield (Standard Webhooks), stripe
  lib/
    crawl.ts              SSRF-guarded crawler (cheerio)
    claude.ts             prompts + structured outputs (zod) + demo fallbacks
    formats.ts            the Aura Format Library
    higgsfield.ts         REST client (submit / status)
    generation.ts         charge → submit → webhook/poll → archive → apply → refund
    stitch.ts             ffmpeg normalization + concat
    credits.ts, auth.ts, storage.ts, project.ts, plans.ts
  components/studio/      the production workspace UI
```

## Roadmap (next)

- Direct publishing to Instagram (Graph API) and TikTok (Content Posting API) with AI labels
- Performance loop: pull post analytics back into the format library
- Aura Network marketplace (self-serve placements + clipper CPM pools)
- Team workspaces, brand character registry, Aura Engine MCP server
- Google OAuth / magic links; login rate limiting
