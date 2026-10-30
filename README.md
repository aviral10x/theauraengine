# Aura Engine

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
cp .env.example .env          # set AUTH_SECRET at minimum for `npm start`
npx prisma db push            # creates prisma/dev.db (SQLite)
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
| `S3_*` | Cloudflare R2 (recommended) or AWS S3 bucket with public read URL | Permanent storage of frames/videos/final cuts (**required in production**) |
| `DATABASE_URL` | Supabase / Neon Postgres | Production database |
| `AUTH_SECRET` | `openssl rand -base64 48` | Session signing (**required in production**) |
| `LEADS_WEBHOOK_URL` *(optional)* | Slack incoming webhook / Zapier | Pinging the team on studio + distribution leads |

## Deploy

1. **Database:** in `prisma/schema.prisma` change `provider = "sqlite"` to `"postgresql"`, set `DATABASE_URL`, run `npx prisma db push`.
2. **Host:** Vercel (Pro plan for 300s function duration on scans/scripts) or any Node host / container. `ffmpeg-static` ships the ffmpeg binary; set `FFMPEG_PATH` to use a system ffmpeg instead.
3. Set `APP_URL` to your https domain. This enables Higgsfield webhooks at `/api/webhooks/higgsfield`.
4. Add the Stripe webhook endpoint and the Higgsfield signing secret.

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
