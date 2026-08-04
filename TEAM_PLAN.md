# Globonexo Sales AI — Team Implementation Plan

**Launch Date:** July 20, 2026  
**Team:** Manasa (AI + voice), Poojitha (data + campaigns + frontend), Simha Teja (reviewer)  
**Document Status:** Locked

---

## 1. Team & Ownership

**Rule:** Each module is owned by exactly one person — no shared module ownership. This prevents confusion and keeps accountability clear.

**Cross-training:** Both Manasa and Poojitha work across frontend and backend (≈50/50 split), but each owns complete modules end-to-end.

### Modules

| Module | Scope (Frontend + Backend) | Owner |
|--------|---------------------------|-------|
| **Auth** | Login, signup, forgot-password pages + Express auth APIs + Supabase Auth integration | Manasa |
| **Onboarding** | 3-step onboarding wizard + onboarding API + agent config creation | Poojitha |
| **Landing / Marketing** | Landing page, pricing, terms, privacy | Poojitha |
| **Dashboard** | Dashboard UI + dashboard KPI API | Poojitha |
| **Campaigns + Leads + Apollo** | Campaigns UI, prospects table, Apollo search, CSV upload + campaigns API, Apollo client, CSV import | Poojitha |
| **Gmail + Email + Inbox** | Gmail connect, email sequences, inbox UI + Gmail OAuth, email send worker, inbox polling, reply handling | Poojitha |
| **Meetings** | Meetings UI (static/mock fallback for v0.1) | Poojitha |
| **AI Engine** | Azure OpenAI client, email generation, reply drafting, voice prompt generation | Manasa |
| **Voice / Retell** | Voice campaign UI + Retell agent setup, outbound calls, webhooks, call history | Manasa |
| **Analytics** | Analytics charts UI + analytics API | Manasa |
| **Billing / Stripe** | Pricing page, billing settings UI + Stripe Checkout, Customer Portal, webhooks | Manasa |
| **Settings** | Settings UI + settings API | Manasa |
| **Admin + Support** | Admin panel, support chat UI + admin APIs, support ticket APIs, Supabase Realtime | Poojitha |
| **Infrastructure** | Express scaffolding, Supabase schema, Redis/BullMQ setup, deployment scripts | Manasa |

### Summary

- **Manasa:** Auth, AI Engine, Voice/Retell, Analytics, Billing, Settings, Infrastructure.
- **Poojitha:** Onboarding, Landing/Marketing, Dashboard, Campaigns/Leads/Apollo, Gmail/Email/Inbox, Meetings, Admin/Support.
- **Simha Teja:** Architecture review, PR reviews, scope enforcement, go/no-go decisions.

---

## 2. Project Structure

**Two separate Git repositories.**

### Frontend Repo: `globonexo-frontend`

```
globonexo-frontend/
├── app/                      # Next.js App Router
├── components/               # React components
├── lib/                      # API clients, helpers
├── public/
├── .env.local.example
├── package.json
├── next.config.mjs
└── README.md
```

### Backend Repo: `globonexo-backend`

```
globonexo-backend/
├── src/
│   ├── config/               # Env, constants
│   ├── routes/               # API route handlers
│   ├── services/             # Business logic
│   ├── workers/              # BullMQ job processors
│   ├── lib/                  # Apollo, Retell, Gmail, OpenAI clients
│   ├── middleware/           # Auth, validation, rate limiting
│   └── index.ts              # Express app entry
├── supabase/
│   └── migrations/           # SQL migrations
├── deploy.sh                 # PM2 deployment script
├── ecosystem.config.js       # PM2 config
├── .env.example
├── package.json
├── API_CONTRACT.md
└── README.md
```

### Docs Location

PRD and team plan live in the **backend repo** (`globonexo-backend/PRD.md`, `globonexo-backend/TEAM_PLAN.md`) because the backend owns the data model and API contract. Frontend repo links to them.

**Structure references:**
- Frontend structure: `FRONTEND_STRUCTURE.md`
- Backend structure: `BACKEND_STRUCTURE.md`


## 3. Frontend Refactoring Notes

The existing prototype (`frontend/components/GlobonexoPrototype.jsx`, 2,828 lines) contains the full visual UI but is **not production-ready**.

### What Exists
- Landing page, auth screens, 7-step onboarding, app shell, dashboard, AI agent chat, prospects, pipeline, campaigns, inbox, meetings, analytics, billing, settings.
- All styling in `globals.css`.
- Hardcoded demo data everywhere.

### What Poojitha Must Do
1. **Split the monolith** into pages and reusable components:
   - `app/page.jsx` → landing
   - `app/(auth)/login/page.jsx`, `signup/page.jsx`, `forgot/page.jsx`
   - `app/(app)/dashboard/page.jsx`, `campaigns/page.jsx`, `leads/page.jsx`, `inbox/page.jsx`, `calls/page.jsx`, `analytics/page.jsx`, `settings/page.jsx`, `billing/page.jsx`, `admin/page.jsx`
   - Shared components in `components/ui/`, `components/layout/`
2. **Remove design-tool code**:
   - Delete the `TweaksPanel`, `useTweaks`, and all tweak-related code at the bottom of `GlobonexoPrototype.jsx`.
3. **Simplify onboarding** from 7 steps to 3 steps (reuse existing step components).
4. **Update Settings** to match locked v0.1 decisions:
   - Remove LinkedIn/SMS channel toggles.
   - Add "Auto-approve AI replies" toggle.
   - Add daily email send cap slider.
5. **Add state management** (React Context or Zustand) for auth and org data.
6. **Add API client** (`lib/api.js`) with credentials included for cookie-based auth.
7. **Add loading/error states** to all screens.
8. **Install dependencies**:
   - `axios` — API calls
   - `date-fns` / `date-fns-tz` — timezone logic
   - `posthog-js` — analytics
   - `@stripe/stripe-js` — Stripe Checkout
   - `zustand` or use Context — state management

---

## 4. Development Workflow

1. **Git:** Two separate repos:
   - `globonexo-frontend` (Poojitha owns)
   - `globonexo-backend` (Manasa owns)
2. **Branching:** Feature branches → PR → review → merge to `main` in each repo.
3. **Frontend deploy:** Vercel auto-deploys `globonexo-frontend/main`.
4. **Backend deploy:** Run `deploy.sh` from `globonexo-backend` local clone to GCP VM.
5. **API contract first:** Backend API changes must update `API_CONTRACT.md` before frontend consumes them.
6. **Daily standup:** 15 min sync (time TBD by team).
7. **Review:** Every PR needs Simha Teja approval before merge.
8. **No direct pushes to main.**

---

## 5. Day-by-Day Plan

> Each task has a checkbox. Manasa and Poojitha check off items as they complete them. Simha Teja reviews at the end of each day.
>
> **Module ownership rule:** A single module is owned by exactly one person. No shared modules.
>
> See `FRONTEND_STRUCTURE.md` and `BACKEND_STRUCTURE.md` for exact file locations.

---

### Week 1 — Foundation (June 16 – June 22)

**Goal:** Auth, onboarding, and project skeleton ready. Each module owner sets up their own codebase.

#### Day 1 — Monday, June 16

**Manasa — Auth + Infrastructure**
- [ ] Set up `globonexo-backend` repo, install dependencies, verify TypeScript build.
- [ ] Run `supabase/migrations/001_initial.sql` against dev project.
- [ ] Review `src/middleware/auth.middleware.ts` and cookie session plan.

**Poojitha — Onboarding + Landing**
- [ ] Set up `globonexo-frontend` repo from existing prototype.
- [ ] Remove `TweaksPanel` and design-tool code.
- [ ] Install dependencies: `axios`, `date-fns`, `posthog-js`, `@stripe/stripe-js`.
- [ ] Create `lib/api.js` with `withCredentials: true`.

**Simha Teja**
- [ ] Review repo split and schema.

#### Day 2 — Tuesday, June 17

**Manasa — Auth module**
- [ ] Implement `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.
- [ ] Set up HTTP-only cookie session with Supabase Auth.
- [ ] Build login, signup, forgot-password frontend pages.

**Poojitha — Onboarding module**
- [ ] Build `/api/onboarding` POST endpoint (org + agent config creation).
- [ ] Refactor onboarding wizard from 7-step to 3-step.
- [ ] Connect onboarding frontend to API.

**Simha Teja**
- [ ] Review auth + onboarding PRs.

#### Day 3 — Wednesday, June 18

**Manasa — Auth module**
- [ ] Add Zod validation for auth payloads.
- [ ] Add auth context/provider in frontend.
- [ ] Add protected route guards.

**Poojitha — Onboarding module**
- [ ] Add Zod validation for onboarding payload.
- [ ] Redirect to dashboard after onboarding.
- [ ] Build celebration screen.

**Simha Teja**
- [ ] End-to-end auth + onboarding test.

#### Day 4 — Thursday, June 19

**Manasa — Settings module**
- [ ] Build `/api/settings` GET/PUT endpoints.
- [ ] Build Settings frontend page (tone, send cap, auto-approve toggle).

**Poojitha — Landing + Marketing**
- [x] Extract pricing section into `/pricing` page.
- [x] Create `/terms` and `/privacy` pages.
- [x] Polish landing page CTA links.

**Simha Teja**
- [ ] Review settings + landing PRs.

#### Day 5 — Friday, June 20

**Manasa — Infrastructure**
- [ ] Set up Redis + BullMQ locally and on GCP VM.
- [ ] Verify all four workers (`send-email`, `poll-inbox`, `schedule-call`, `enrich-leads`) start.
- [ ] Add job enqueue helpers in `src/jobs/`.

**Poojitha — Campaigns module (setup)**
- [ ] Build campaign list page.
- [ ] Build campaign creation shell UI (channel, name, ICP source).

**Simha Teja**
- [ ] Review queue design.

#### Day 6 — Saturday, June 21

**Manasa — AI Engine module**
- [ ] Set up Azure OpenAI client.
- [ ] Build prompt template engine.
- [ ] Build `/api/ai/generate-email` endpoint.

**Poojitha — Campaigns + Leads module**
- [ ] Build Apollo search UI and connect to `/api/leads/apollo-search`.
- [ ] Start CSV upload component.

**Simha Teja**
- [ ] Weekend check-in.

#### Day 7 — Sunday, June 22

**Manasa**
- [ ] Buffer / testing / bug fixes.

**Poojitha**
- [ ] Buffer / testing / bug fixes.

**Simha Teja**
- [ ] Sync on Week 2 priorities.

---

### Week 2 — Email Core Loop (June 23 – June 29)

**Goal:** Campaigns, leads, email send, inbox reply flow all working.

#### Day 8 — Monday, June 23

**Manasa — AI Engine module**
- [ ] Generate subject + body from agent config + campaign context + lead data.
- [ ] Add email sequence step support to prompt generation.

**Poojitha — Campaigns + Leads module**
- [ ] Build `/api/leads/apollo-search` and `/api/leads/apollo-enrich`.
- [ ] Build leads table UI with search/filter.
- [ ] Save enriched leads to DB.

**Simha Teja**
- [ ] Review AI + lead enrichment integration.

#### Day 9 — Tuesday, June 24

**Manasa — AI Engine module**
- [ ] Build `/api/ai/generate-reply` endpoint.
- [ ] Generate AI draft reply from conversation history.

**Poojitha — Campaigns + Leads module**
- [ ] Build CSV upload parser and background import job.
- [ ] Build CSV upload UI with progress/errors.

**Simha Teja**
- [ ] Review CSV + reply generation.

#### Day 10 — Wednesday, June 25

**Manasa — AI Engine module**
- [ ] Add structured output / JSON mode for emails.
- [ ] Test AI email generation with real onboarding data.

**Poojitha — Campaigns + Leads module**
- [ ] Build campaign sequence editor (3 steps, editable delays).
- [ ] Build lead selector inside campaign creation.

**Simha Teja**
- [ ] Review prompt architecture + campaign form.

#### Day 11 — Thursday, June 26

**Manasa — AI Engine module (support)**
- [ ] Ensure `/api/ai/generate-email` is stable for Poojitha to call from worker.
- [ ] Add error handling and retries for OpenAI calls.

**Poojitha — Gmail + Email module**
- [ ] Implement Gmail OAuth connect/disconnect backend.
- [ ] Build `send-email` BullMQ worker using Gmail API (calls Manasa's AI endpoint to generate email).
- [ ] Implement Gmail daily send cap and queue pause.

**Simha Teja**
- [ ] Review email send flow.

#### Day 12 — Friday, June 27

**Manasa — AI Engine module (support)**
- [ ] Ensure `/api/ai/generate-reply` is stable for Poojitha to call from inbox flow.
- [ ] Add prompt fallback for missing conversation history.

**Poojitha — Gmail + Email module**
- [ ] Build `poll-inbox` worker to fetch replies every 3 minutes.
- [ ] Match replies by Gmail thread ID.
- [ ] Call Manasa's AI endpoint to generate draft reply.
- [ ] Save replies + AI drafts to `email_replies` table.
- [ ] Build Inbox thread list UI.

**Simha Teja**
- [ ] Review reply matching.

#### Day 13 — Saturday, June 28

**Manasa — AI Engine module**
- [ ] Add tone/obection handling to prompts.
- [ ] Test end-to-end AI email + reply generation.

**Poojitha — Gmail + Email module**
- [ ] Build thread view UI.
- [ ] Build AI draft actions: Approve, Edit, Regenerate, Reject.
- [ ] Send approved replies via Gmail API.

**Simha Teja**
- [ ] Weekend check-in.

#### Day 14 — Sunday, June 29

**Manasa**
- [ ] Buffer / testing / bug fixes.

**Poojitha**
- [ ] Buffer / testing / bug fixes.

**Simha Teja**
- [ ] Sync on Week 3 priorities.

---

### Week 3 — Voice + Billing + Dashboard (June 30 – July 6)

**Goal:** Voice calls, Stripe billing, and dashboard working.

#### Day 15 — Monday, June 30

**Manasa — Voice / Retell module**
- [ ] Set up Retell client and buy test phone number.
- [ ] Create Retell agent per organization via API.
- [ ] Generate voice system prompt from agent config.

**Poojitha — Dashboard module**
- [ ] Build `/api/dashboard` aggregation query.
- [ ] Build Dashboard UI with KPI cards, activity feed, tasks, weekly goal.

**Simha Teja**
- [ ] Review Retell integration + dashboard design.

#### Day 16 — Tuesday, July 1

**Manasa — Voice / Retell module**
- [ ] Build voice campaign creation UI.
- [ ] Add AI/manual mode toggle and calling hours config.
- [ ] Build `schedule-call` worker to trigger Retell outbound calls.

**Poojitha — Dashboard module**
- [ ] Wire Dashboard UI to real data.
- [ ] Add "next meeting" widget.

**Simha Teja**
- [ ] Review call scheduling.

#### Day 17 — Wednesday, July 2

**Manasa — Voice / Retell module**
- [ ] Implement Retell webhooks (`call_started`, `call_ended`, `call_analyzed`).
- [ ] Store transcript, recording URL, disposition in `calls` table.
- [ ] Build call history UI.

**Poojitha — Meetings module**
- [x] Build Meetings UI from prototype.
- [x] Use calendar booking link only (no native booking).

**Simha Teja**
- [ ] Review call data model.

#### Day 18 — Thursday, July 3

**Manasa — Billing / Stripe module**
- [ ] Create Stripe products and prices.
- [ ] Implement `/api/billing/checkout` and `/api/billing/portal`.
- [ ] Build pricing page and billing/settings UI.

**Poojitha — Pipeline + Prospects polish**
- [x] Polish prospects table and filters.
- [x] Polish pipeline board UI.

**Simha Teja**
- [ ] Review billing + pipeline polish.

#### Day 19 — Friday, July 4

**Manasa — Billing / Stripe module**
- [ ] Implement `/webhooks/stripe` handler.
- [ ] Handle `checkout.session.completed`, `invoice.paid`, `subscription.deleted`.
- [ ] Build plan gating middleware.

**Poojitha — Pipeline + Prospects polish**
- [x] Polish prospects table and filters.
- [x] Polish pipeline board UI.

**Simha Teja**
- [ ] Review webhook security.

#### Day 20 — Saturday, July 5

**Manasa — Voice / Retell module**
- [ ] Test full voice campaign end-to-end.
- [ ] Handle call failures and retries.

**Poojitha — Admin + Support module**
- [x] Build admin panel UI.
- [x] Build admin APIs for orgs/users/campaigns + suspend/impersonate.

**Simha Teja**
- [ ] Weekend check-in.

#### Day 21 — Sunday, July 6

**Manasa**
- [ ] Buffer / testing / bug fixes.

**Poojitha**
- [ ] Buffer / testing / bug fixes.

**Simha Teja**
- [ ] Sync on Week 4 priorities.

---

### Week 4 — Admin + Support + Polish + Staging (July 7 – July 13)

**Goal:** All modules complete and stable on staging.

#### Day 22 — Monday, July 7

**Manasa — Settings + Billing polish**
- [ ] Wire Settings UI to `/api/settings`.
- [ ] Wire Billing UI to Stripe.

**Poojitha — Admin + Support module**
- [x] Build support chat UI for users.
- [x] Build support ticket APIs with Supabase Realtime.

**Simha Teja**
- [ ] Review settings + support.

#### Day 23 — Tuesday, July 8

**Manasa — Analytics module**
- [ ] Build `/api/analytics/campaigns` and `/api/analytics/calls`.
- [ ] Build Analytics charts UI (bar, line, funnel).
- [ ] Add PostHog event tracking backend.

**Poojitha — Admin + Support module**
- [x] Build admin support ticket reply UI.
- [x] Send email notification on admin reply.

**Simha Teja**
- [ ] Review analytics + support.

#### Day 24 — Wednesday, July 9

**Manasa — AI Agent chat module**
- [ ] Build AI Agent chat UI.
- [ ] Connect quick actions to backend.
- [ ] Provide static/mock responses for v0.1.

**Poojitha — Campaigns + Leads final polish**
- [x] Final polish on campaigns, prospects, pipeline, inbox.
- [x] Add loading/empty/error states.

**Simha Teja**
- [ ] Review AI agent chat.

#### Day 25 — Thursday, July 10

**Manasa — Security + Infrastructure**
- [ ] Review and test rate limiting.
- [ ] Verify auth middleware on all routes.
- [ ] Test Redis/BullMQ reliability.

**Poojitha — Frontend cross-cutting**
- [x] Add PostHog event tracking on frontend.
- [x] Add error boundaries.
- [x] Add loading skeletons.
- [x] Verify all routes and links.

**Simha Teja**
- [ ] Scope check — decide what to cut if behind.

#### Day 26 — Friday, July 11

**Manasa**
- [ ] Fix critical backend bugs.
- [ ] Load test queue + API.

**Poojitha**
- [x] Fix critical frontend bugs.
- [x] Cross-browser and mobile sanity check.

**Simha Teja**
- [ ] Code review + scope check.

#### Day 27 — Saturday, July 12

**Manasa**
- [ ] End-to-end staging testing (backend).

**Poojitha**
- [ ] End-to-end staging testing (frontend).

**Simha Teja**
- [ ] Run full smoke tests.

#### Day 28 — Sunday, July 13

**Manasa**
- [ ] Buffer / bug fixes.

**Poojitha**
- [ ] Buffer / bug fixes.

**Simha Teja**
- [ ] Go/no-go for production deploy.

---

### Week 5 — Launch Week (July 14 – July 20)

**Goal:** Production-ready, secure, launched.

#### Day 29 — Monday, July 14

**Manasa**
- [ ] Audit Supabase RLS policies.
- [ ] Audit secrets management.
- [ ] Verify API authentication on all routes.

**Poojitha**
- [ ] Audit frontend input validation.
- [ ] Check for XSS vulnerabilities.
- [ ] Review frontend auth guards.

**Simha Teja**
- [ ] Security review.

#### Day 30 — Tuesday, July 15

**Manasa**
- [ ] Deploy backend to production GCP VM.
- [ ] Deploy Redis + PM2 workers.
- [ ] Pull secrets from GCP Secret Manager.
- [ ] Verify backend health checks.

**Poojitha**
- [ ] Deploy frontend to Vercel production.
- [ ] Cut over DNS to `app.globonexo.com`.
- [ ] Verify frontend builds and connects to API.

**Simha Teja**
- [ ] Deploy sign-off.

#### Day 31 — Wednesday, July 16

**Manasa**
- [ ] Production smoke test: auth, onboarding, settings, billing, voice, AI.
- [ ] Verify BullMQ workers processing jobs.
- [ ] Check error logs in Cloud Logging.

**Poojitha**
- [ ] Production smoke test: landing, campaigns, leads, inbox, dashboard, admin, support.
- [ ] Cross-browser sanity check.

**Simha Teja**
- [ ] Verify all critical paths pass.

#### Day 32 — Thursday, July 17

**Manasa**
- [ ] Final review of API docs and billing flow.
- [ ] Verify Stripe webhooks receiving events.

**Poojitha**
- [ ] Final landing page + marketing UI pass.
- [ ] Verify all links and CTAs work.

**Simha Teja**
- [ ] Marketing review.

#### Day 33 — Friday, July 18

**Manasa**
- [ ] Final backend bug fixes.
- [ ] Verify monitoring alerts.

**Poojitha**
- [ ] Final frontend bug fixes.
- [ ] Verify PostHog events firing.

**Simha Teja**
- [ ] Release candidate approval.

#### Day 34 — Saturday, July 19

**Manasa**
- [ ] Launch preview.
- [ ] Final monitoring and logging setup.
- [ ] Prepare rollback plan.

**Poojitha**
- [ ] Launch preview.
- [ ] Final docs and help content.
- [ ] Prepare launch announcement assets.

**Simha Teja**
- [ ] Final go/no-go decision.

#### Day 35 — Sunday, July 20 — 🚀 PUBLIC LAUNCH

**Manasa**
- [ ] Monitor backend health, queues, AI, voice, billing.
- [ ] Respond to production issues immediately.

**Poojitha**
- [ ] Monitor frontend, campaigns, inbox, dashboard, support.
- [ ] Respond to UX issues immediately.

**Simha Teja**
- [ ] Launch commander — coordinate team response.
- [ ] Communicate status to stakeholders.

---

## 6. Supabase Schema

Run as a single migration file: `supabase/migrations/001_initial.sql`

```sql
-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'unused';

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  plan_id TEXT NOT NULL DEFAULT 'starter',
  subscription_status TEXT NOT NULL DEFAULT 'payment_required',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (single user per org for v0.1)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supabase_uid UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent configuration from onboarding
CREATE TABLE agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL DEFAULT 'Nexo',
  product_description TEXT NOT NULL,
  value_proposition TEXT NOT NULL,
  objections TEXT,
  tone TEXT NOT NULL DEFAULT 'consultative',
  icp_titles TEXT[] NOT NULL DEFAULT '{}',
  icp_company_sizes TEXT[] NOT NULL DEFAULT '{}',
  icp_geos TEXT[] NOT NULL DEFAULT '{}',
  booking_link TEXT,
  retell_agent_id TEXT,
  retell_phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connected accounts (Gmail, etc.)
CREATE TABLE connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'gmail'
  provider_account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, provider)
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'voice')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed')),
  agent_config_id UUID REFERENCES agent_configs(id),
  prompt_context TEXT,
  max_leads INTEGER NOT NULL DEFAULT 100,
  daily_send_cap INTEGER NOT NULL DEFAULT 100,
  call_cadence_per_hour INTEGER NOT NULL DEFAULT 5,
  voice_mode TEXT NOT NULL DEFAULT 'ai' CHECK (voice_mode IN ('ai','manual')),
  business_hours_start TIME NOT NULL DEFAULT '09:00',
  business_hours_end TIME NOT NULL DEFAULT '17:00',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence steps for email campaigns
CREATE TABLE email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  delay_days INTEGER NOT NULL,
  subject_template TEXT,
  body_prompt_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('apollo','csv','manual')),
  apollo_id TEXT,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  timezone TEXT,
  score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','enrichment_failed','queued','contacted','engaged','meeting_booked','not_interested','unsubscribed')),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email messages sent
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sequence_step_id UUID REFERENCES email_sequence_steps(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','bounced')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email replies received
CREATE TABLE email_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email_message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  gmail_message_id TEXT,
  ai_draft_reply TEXT,
  ai_draft_status TEXT NOT NULL DEFAULT 'pending' CHECK (ai_draft_status IN ('pending','approved','rejected','sent')),
  received_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  retell_call_id TEXT UNIQUE,
  from_number TEXT,
  to_number TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','in_progress','completed','failed','voicemail')),
  transcript TEXT,
  recording_url TEXT,
  disposition TEXT CHECK (disposition IN ('interested','not_interested','meeting_booked','voicemail','callback','no_answer')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  -- No free-trial field: billing is required before onboarding.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support messages
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user','admin')),
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (basic org isolation)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Note: Express uses service role key, but RLS policies are safety net.
-- Admin access will use a separate admin role or bypass via service key.
```

---

## 7. API Contract (Express Backend)

### Auth

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| POST | `/api/auth/signup` | Create account + org | Manasa |
| POST | `/api/auth/login` | Login, set cookie | Manasa |
| POST | `/api/auth/logout` | Clear cookie | Manasa |
| POST | `/api/auth/google` | Google OAuth callback | Manasa |
| POST | `/api/auth/forgot-password` | Send reset email | Manasa |
| POST | `/api/auth/reset-password` | Reset password | Manasa |
| GET | `/api/auth/me` | Current user + org | Manasa |

### Onboarding

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| POST | `/api/onboarding` | Submit onboarding, create agent config | Poojitha |
| GET | `/api/onboarding` | Get onboarding progress | Poojitha |
| PUT | `/api/onboarding` | Update agent config | Poojitha |

### Gmail

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/gmail/auth-url` | Get Google OAuth URL | Poojitha |
| POST | `/api/gmail/callback` | OAuth callback, store tokens | Poojitha |
| GET | `/api/gmail/status` | Check Gmail connection | Poojitha |
| DELETE | `/api/gmail/disconnect` | Remove Gmail connection | Poojitha |

### Campaigns

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/campaigns` | List campaigns | Poojitha |
| POST | `/api/campaigns` | Create campaign | Poojitha |
| GET | `/api/campaigns/:id` | Get campaign details | Poojitha |
| PUT | `/api/campaigns/:id` | Update campaign | Poojitha |
| POST | `/api/campaigns/:id/launch` | Launch campaign | Poojitha |
| POST | `/api/campaigns/:id/pause` | Pause campaign | Poojitha |
| DELETE | `/api/campaigns/:id` | Delete campaign | Poojitha |

### Leads

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/leads` | List leads | Poojitha |
| POST | `/api/leads` | Add manual lead | Poojitha |
| POST | `/api/leads/apollo-search` | Search Apollo | Poojitha |
| POST | `/api/leads/apollo-enrich` | Enrich selected leads | Poojitha |
| POST | `/api/leads/csv-upload` | Upload CSV | Poojitha |
| DELETE | `/api/leads/:id` | Delete lead | Poojitha |

### Emails

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| POST | `/api/emails/:replyId/approve` | Approve AI draft | Poojitha |
| POST | `/api/emails/:replyId/regenerate` | Regenerate AI draft | Manasa |
| POST | `/api/emails/send-test` | Send test email | Manasa |

### Inbox

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/inbox` | List threads/replies | Poojitha |
| GET | `/api/inbox/:id` | Get thread details | Poojitha |
| POST | `/api/inbox/:id/reply` | Send manual reply | Poojitha |

### Voice / Calls

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| POST | `/api/voice/agents` | Create/update Retell agent | Manasa |
| POST | `/api/voice/calls/:callId/retry` | Retry failed call | Manasa |
| POST | `/webhooks/retell` | Retell webhooks | Manasa |
| GET | `/api/calls` | List calls | Manasa |
| GET | `/api/calls/:id` | Get call details | Manasa |

### AI

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| POST | `/api/ai/generate-email` | Generate email for lead | Manasa |
| POST | `/api/ai/generate-reply` | Generate reply draft | Manasa |
| POST | `/api/ai/generate-voice-prompt` | Generate Retell prompt | Manasa |

### Billing

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| POST | `/api/billing/checkout` | Create Stripe Checkout session | Manasa |
| POST | `/api/billing/portal` | Create Stripe Customer Portal session | Manasa |
| POST | `/webhooks/stripe` | Stripe webhooks | Manasa |

### Dashboard & Analytics

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/dashboard` | KPIs + activity feed | Poojitha |
| GET | `/api/analytics/campaigns` | Campaign performance | Poojitha |
| GET | `/api/analytics/calls` | Voice performance | Poojitha |

### Settings

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/settings` | Get settings | Poojitha |
| PUT | `/api/settings` | Update settings | Poojitha |

### Admin

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/admin/organizations` | List orgs | Poojitha |
| POST | `/api/admin/organizations/:id/suspend` | Suspend org | Poojitha |
| POST | `/api/admin/organizations/:id/impersonate` | Get impersonation token | Poojitha |
| GET | `/api/admin/metrics` | Top-level metrics | Poojitha |

### Support

| Method | Route | Description | Owner |
|--------|-------|-------------|-------|
| GET | `/api/support/tickets` | List user tickets | Poojitha |
| POST | `/api/support/tickets` | Create ticket | Poojitha |
| GET | `/api/support/tickets/:id/messages` | List messages | Poojitha |
| POST | `/api/support/tickets/:id/messages` | Send message | Poojitha |

---

## 8. Environment Variables

### Backend (`globonexo-backend/.env`)

```bash
# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://app.globonexo.com

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...

# Auth
JWT_SECRET=...
COOKIE_SECRET=...

# Google OAuth (Gmail)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.globonexo.com/api/gmail/callback

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o

# Retell
RETELL_API_KEY=...
RETELL_WEBHOOK_SECRET=...

# Apollo
APOLLO_API_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_SCALE=price_...

# Resend
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@globonexo.com

# Redis
REDIS_URL=redis://localhost:6379

# PostHog
POSTHOG_API_KEY=...
POSTHOG_HOST=https://us.i.posthog.com

# Sentry
SENTRY_DSN=...
```

### Frontend (`globonexo-frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=https://api.globonexo.com
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 9. Deployment Guide

### Backend Deploy (PM2 + deploy.sh)

Run from the `globonexo-backend` repo root.

```bash
# On local machine
cd globonexo-backend
./deploy.sh
```

```bash
# deploy.sh contents:
#!/bin/bash
set -e
git pull origin main
npm ci
npm run build
pm2 reload ecosystem.config.js --env production
```

### PM2 Config (`ecosystem.config.js`)

```js
module.exports = {
  apps: [
    {
      name: 'globonexo-api',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'globonexo-workers',
      script: './dist/workers/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      log_file: './logs/workers.log',
    },
  ],
};
```

### Frontend Deploy

- Connect `globonexo-frontend` GitHub repo to Vercel.
- Set environment variables in Vercel dashboard.
- Auto-deploy on push to `main`.

### GCP Setup Checklist

- [ ] Create Compute Engine e2-medium VM (Ubuntu 22.04 LTS).
- [ ] Install Node.js 20, PM2, Redis.
- [ ] Open firewall ports: 22 (SSH), 80, 443 (HTTPS), 3000 (internal API).
- [ ] Install Caddy or Nginx for reverse proxy + SSL.
- [ ] Install Google Cloud Ops Agent for logging.
- [ ] Store secrets in Secret Manager; pull into `.env` on deploy.
- [ ] Configure Cloud DNS for `api.globonexo.com` and `app.globonexo.com`.

---

## 10. Review Checkpoints

Simha Teja must approve before proceeding past each checkpoint:

1. **End of Week 1 (Jun 22):** Auth + onboarding + schema complete.
2. **End of Week 2 (Jun 29):** Email send/receive loop complete end-to-end.
3. **End of Week 3 (Jul 6):** Voice calls + Stripe billing complete.
4. **End of Week 4 (Jul 13):** All UI wired, staging smoke tests pass.
5. **Jul 16:** Production smoke tests pass.
6. **Jul 19:** Final go/no-go for public launch.

---

## 11. Daily Rituals

- **Daily standup:** 15 min.
  - What did you complete yesterday?
  - What are you working on today?
  - What is blocking you?
- **PR review:** Simha Teja reviews all PRs within 4 hours.
- **End-of-day sync:** Quick message in team chat with status + blockers.

---

## 12. Scope Escalation Rules

If any task threatens the timeline, escalate to Simha Teja immediately. Default cuts (in priority order):

1. Cut pipeline board polish.
2. Cut meetings calendar polish.
3. Cut advanced analytics charts.
4. Cut AI agent chat screen.
5. Cut admin panel advanced features.
6. Cut voice manual mode (keep AI mode only).
7. As last resort: defer voice to v0.2 and launch email-only.

**Nothing new gets added without removing something of equal size.**
