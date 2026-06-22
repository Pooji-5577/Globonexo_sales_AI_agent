# Globonexo Sales AI — Product Requirements Document (PRD)

**Version:** 0.1  
**Target Launch:** July 20, 2026  
**Status:** Locked after design interview  
**Audience:** Manasa, Poojitha, Simha Teja (reviewer)

---

## 1. Overview

Globonexo Sales AI is a multi-tenant SaaS platform that lets businesses hire an AI sales agent. The agent finds B2B leads, writes personalized outbound emails, handles replies, and makes AI voice calls to book meetings.

### North Star

A user can sign up, onboard in under 5 minutes, launch an email + voice campaign, and have the AI agent book meetings on their calendar link without manual prospecting.

---

## 2. Goals & Success Criteria

### Primary Goal

Ship a **publicly launchable v0.1** on **July 20, 2026** that supports:

1. Paid signup via Stripe.
2. AI agent onboarding.
3. Lead sourcing via Apollo.io and CSV upload.
4. Multi-step AI-generated email sequences (Gmail-only).
5. AI voice calls via Retell AI.
6. Human-in-the-loop reply approval.
7. Basic dashboard, campaigns, leads, inbox, meetings, analytics, admin panel.

### Success Metrics (first 30 days post-launch)

| Metric | Target |
|--------|--------|
| Public signups | 50+ |
| Completed onboardings | 30+ |
| Active campaigns | 10+ |
| Emails sent by AI | 1,000+ |
| AI voice calls completed | 100+ |
| Meetings booked | 20+ |
| Uptime | 99.5% |

---

## 3. Target Audience

- Small to mid-market B2B companies in the US.
- Founders, sales leaders, and account executives who want to automate outbound prospecting.
- First customers will likely be early adopters comfortable with AI tools.

---

## 4. Key Design Decisions (Locked)

| Area | Decision |
|------|----------|
| **Product type** | Multi-tenant SaaS for B2B sales AI agent |
| **Launch type** | Public launch (not private beta) |
| **Channels** | Email + voice for v0.1; SMS deferred; WhatsApp v0.2 |
| **Email provider** | User's Gmail via Google OAuth + Gmail API |
| **Voice provider** | Retell AI with phone numbers purchased inside Retell |
| **Lead sources** | Apollo.io API search + CSV upload |
| **CRM sync** | Deferred to v0.2 |
| **AI model** | Azure OpenAI GPT-4o |
| **Backend** | Node.js + Express on GCP Compute Engine VM |
| **Database** | Supabase Postgres |
| **Auth** | Supabase Auth mediated through Express with HTTP-only cookies |
| **Frontend** | Next.js 15 on Vercel |
| **Queue** | BullMQ + Redis (Redis runs on same VM) |
| **File storage** | Supabase Storage |
| **Payments** | Stripe (Checkout + Customer Portal) |
| **Monitoring** | Sentry + GCP Cloud Logging + UptimeRobot |
| **Analytics** | PostHog |
| **Transactional email** | Resend |
| **Support** | In-app chat via Supabase Realtime + email notifications |
| **Admin panel** | Minimal read-only/suspend/impersonate UI |
| **Geography** | US only |

---

## 5. Core User Flows

### 5.1 Signup & Onboarding

1. Visitor lands on marketing site.
2. Selects a plan and pays via Stripe Checkout.
3. Creates account (email/password or Google OAuth).
4. Completes 3-step onboarding wizard:
   - Step 1: About you + company
   - Step 2: Ideal customer profile
   - Step 3: Value prop, tone, booking link, agent name
5. Connects Gmail account.
6. Optionally purchases/configures Retell phone number.
7. Lands on dashboard.

### 5.2 Create & Launch Email Campaign

1. User clicks "New campaign".
2. Selects channel = email.
3. Defines ICP filters or uploads CSV.
4. System fetches/enriches up to 100 leads.
5. User reviews/edits 3-step email sequence.
6. User sets sending cadence (default: 12 emails/hour, 9am–5pm lead timezone, Mon–Fri).
7. User launches campaign.
8. Emails enter BullMQ queue.
9. Worker sends emails via Gmail API.
10. System polls Gmail inbox for replies.
11. When reply arrives, AI drafts response; appears in Inbox pending approval.
12. User approves/edits/sends reply.
13. If prospect agrees to meeting, agent sends calendar link.

### 5.3 Create & Launch Voice Campaign

1. User clicks "New campaign".
2. Selects channel = voice.
3. Selects leads (must have phone numbers).
4. System validates lead timezones.
5. User sets calling hours and cadence (default: 5 calls/hour, business hours, Mon–Fri).
6. User chooses AI mode or manual mode.
7. User launches campaign.
8. Worker schedules calls via BullMQ.
9. Retell makes outbound calls.
10. Agent discloses it is an AI at start of call.
11. Retell webhooks update call status, transcript, recording URL, disposition.
12. If meeting booked, agent sends calendar link via email/SMS if available.

### 5.4 Reply Handling

1. Gmail inbox polling worker fetches new messages.
2. Matches reply to existing `email_messages` by Gmail thread ID.
3. AI generates draft reply using conversation history + agent config.
4. Draft appears in Inbox with "Approve / Edit / Regenerate" actions.
5. If auto-approve enabled in settings, draft sends automatically.
6. Otherwise human approves.

---

## 6. Functional Requirements

### 6.1 Marketing Site

- [x] Landing page with hero, how it works, results, pricing, CTA.
- [x] Pricing page with 3 plans.
- [x] Sign up / log in links.
- [x] Terms of Service and Privacy Policy pages.

### 6.2 Authentication

- [ ] Signup with email/password and Google OAuth.
- [ ] Login with email/password and Google OAuth.
- [ ] Forgot password flow.
- [ ] HTTP-only cookie session managed by Express.
- [ ] Supabase Auth as identity provider.
- [ ] Single user per organization.

### 6.3 Onboarding (3-step wizard)

**Step 1 — About you + company**
- First name, last name
- Company name
- Company website

**Step 2 — Ideal customer profile**
- Target job titles
- Target company sizes
- Target geographies

**Step 3 — Agent configuration**
- What you sell (product description)
- Value proposition
- Common objections
- Tone (consultative, direct, friendly, formal, challenger)
- Calendar booking link
- Agent name

Onboarding creates:
- `organizations` row
- `agent_configs` row

### 6.4 Gmail Integration

- [ ] Google OAuth with scopes: `gmail.send`, `gmail.readonly`, `openid`, `email`, `profile`.
- [ ] Store refresh token encrypted in `connected_accounts`.
- [ ] Send emails via Gmail API using user's account.
- [ ] Poll inbox every 3 minutes for replies.
- [ ] Daily send cap: default 100, max 500 per Gmail account.
- [ ] Apply for Google OAuth app verification immediately.

### 6.5 Campaigns

- [ ] Create campaign (email or voice).
- [ ] Select lead source: Apollo search or CSV upload.
- [ ] Enrich up to 100 leads per campaign.
- [ ] 3-step email sequence with editable delays (default: Day 0, Day 3, Day 7).
- [ ] AI-generated content per step.
- [ ] Per-campaign prompt context/angle.
- [ ] Set sending/calling hours and cadence.
- [ ] AI mode vs manual mode for voice.
- [ ] Launch, pause, resume campaign.
- [ ] Campaign status: draft, active, paused, completed.

### 6.6 Leads / Prospects

- [ ] Leads table with name, title, company, email, phone, score, status, source.
- [ ] Apollo search by title, company size, geography.
- [ ] Bulk enrich leads via Apollo (up to 100/campaign).
- [ ] CSV upload with required columns: first_name, email, company.
- [ ] Optional columns: last_name, title, phone, location, linkedin_url.
- [ ] Deduplicate by email within campaign.

### 6.7 Email Agent

- [ ] Generate personalized intro email per lead using Azure OpenAI.
- [ ] Generate follow-up emails referencing previous messages.
- [ ] Include unsubscribe link and sender address (CAN-SPAM).
- [ ] Queue emails with BullMQ.
- [ ] Respect Gmail rate limits and business hours.
- [ ] Stop sequence on reply.
- [ ] Track opens/replies (via Gmail thread matching).

### 6.8 Voice Agent (Retell)

- [ ] One Retell agent per organization.
- [ ] Purchase phone number inside Retell.
- [ ] Generate system prompt from onboarding + campaign context.
- [ ] Inject per-call variables via `retell_llm_dynamic_variables`.
- [ ] AI disclosure at start of every call.
- [ ] Recording only after verbal consent.
- [ ] Handle Retell webhooks: call_started, call_ended, call_analyzed.
- [ ] Store transcript, recording URL, disposition.
- [ ] Default 5 calls/hour during lead business hours, Mon–Fri.

### 6.9 Inbox

- [ ] List email threads with unread/hot indicators.
- [ ] View full conversation.
- [ ] View AI-drafted reply.
- [ ] Approve, edit, regenerate, or reject AI reply.
- [ ] Send approved reply via Gmail.
- [ ] Tag conversations (positive, pricing, forwarded, nurture, question, etc.).

### 6.10 Dashboard

- [ ] KPI cards: emails sent, replies, meetings booked, hot leads, pipeline value.
- [ ] Activity feed.
- [ ] Tasks requiring attention.
- [ ] Weekly meeting goal progress.
- [ ] Next meeting preview.

### 6.11 Analytics

- [ ] Campaign performance: enrolled, sent, opens, replies, meetings.
- [ ] Voice performance: calls made, answered, meetings booked.
- [ ] PostHog event tracking for key product events.

### 6.12 Settings

- [ ] Profile.
- [ ] Organization details.
- [ ] Connected accounts (Gmail, Retell).
- [ ] Plan status and billing portal link.
- [ ] Auto-approve AI replies toggle (default OFF).
- [ ] Daily email send cap.

### 6.13 Billing

- [ ] Stripe Checkout for signup.
- [ ] Stripe Customer Portal for plan changes/cancellations.
- [ ] Subscription status gates feature access.
- [ ] Webhook handler for `checkout.session.completed`, `invoice.paid`, `subscription.deleted`.

### 6.14 Admin Panel

- [ ] View all organizations, users, campaigns.
- [ ] Suspend organization.
- [ ] Impersonate organization.
- [ ] View top-level metrics.
- [ ] In-app support chat replies.

### 6.15 Support Chat

- [ ] User creates support ticket from app.
- [ ] Real-time messages via Supabase Realtime.
- [ ] Email notification on admin reply.
- [ ] Admin replies from admin panel.

---

## 7. Non-Functional Requirements

### 7.1 Performance

- API response time < 500ms for 95th percentile.
- Dashboard loads in < 2 seconds.
- Email queue processes within 1 minute of scheduled time.

### 7.2 Reliability

- Background jobs retry 3 times with exponential backoff.
- Failed jobs are logged and visible in Sentry.
- Daily Supabase backups enabled.

### 7.3 Security

- HTTPS everywhere.
- Supabase RLS enabled on all tables.
- Zod validation on all API inputs.
- Rate limiting on public endpoints.
- Secrets stored in GCP Secret Manager.
- Encrypt sensitive tokens at rest (Gmail refresh tokens).

### 7.4 Compliance

- US-only launch.
- AI disclosure at start of every voice call and in first SMS (if SMS later).
- Call recording only with verbal consent.
- CAN-SPAM compliance: unsubscribe link and physical address in every outbound email.
- Clear Terms of Service placing compliance responsibility on tenant.
- No personal/GDPR-sensitive prospecting outside US.

### 7.5 Scalability

- Designed for 100 concurrent organizations.
- 10,000 leads, 50,000 emails/month initial capacity.
- Redis + BullMQ supports horizontal scaling later.

---

## 8. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, CSS modules/globals.css |
| Backend | Node.js, Express.js, TypeScript |
| Database | Supabase Postgres |
| Auth | Supabase Auth + Express cookie session |
| Queue | BullMQ + Redis |
| AI | Azure OpenAI GPT-4o |
| Voice | Retell AI |
| Lead Data | Apollo.io API |
| Email Send | Gmail API |
| Transactional Email | Resend |
| Payments | Stripe |
| Storage | Supabase Storage |
| Hosting Frontend | Vercel |
| Hosting Backend | GCP Compute Engine (e2-medium) |
| Logs | GCP Cloud Logging |
| Secrets | GCP Secret Manager |
| Monitoring | Sentry, UptimeRobot |
| Analytics | PostHog |
| DNS | Cloud DNS |

---

## 9. Project Structure

### Repo Split

| Repo | Purpose | Primary Owner |
|------|---------|---------------|
| `globonexo-frontend` | Next.js app, UI components, marketing pages | Poojitha |
| `globonexo-backend` | Express API, workers, integrations, admin | Manasa |
| `globonexo-docs` (optional) | Shared PRD, TEAM_PLAN, API_CONTRACT | Simha Teja |

### Frontend Repo: `globonexo-frontend`

#### App Router Pages

| Route Group | Page | Purpose |
|-------------|------|---------|
| `(marketing)` | `/` | Landing page |
| `(marketing)` | `/pricing` | Pricing page |
| `(marketing)` | `/terms` | Terms of Service |
| `(marketing)` | `/privacy` | Privacy Policy |
| `(auth)` | `/login` | Login |
| `(auth)` | `/signup` | Sign up |
| `(auth)` | `/forgot-password` | Forgot password |
| `(app)` | `/dashboard` | Main dashboard |
| `(app)` | `/agent` | AI agent chat |
| `(app)` | `/prospects` | Leads table |
| `(app)` | `/pipeline` | Pipeline board |
| `(app)` | `/campaigns` | Campaign list |
| `(app)` | `/campaigns/new` | Create campaign |
| `(app)` | `/campaigns/[id]` | Campaign detail |
| `(app)` | `/inbox` | Email inbox |
| `(app)` | `/meetings` | Meetings list |
| `(app)` | `/analytics` | Analytics charts |
| `(app)` | `/billing` | Billing and plan |
| `(app)` | `/settings` | Settings |
| `(app)` | `/support` | Support chat |
| `admin` | `/admin` | Admin panel |

#### Component Folders

| Folder | Contents |
|--------|----------|
| `components/ui` | Button, Card, Input, Select, Toggle, Badge, Avatar, Icon, Modal |
| `components/layout` | AppShell, Sidebar, TopBar, AuthAside, LandingNav |
| `components/auth` | LoginForm, SignupForm, ForgotPasswordForm |
| `components/onboarding` | OnboardingLayout, Step1About, Step2ICP, Step3Agent |
| `components/dashboard` | KPICard, ActivityFeed, TaskList, WeeklyGoal, NextMeeting |
| `components/campaigns` | CampaignList, CampaignCard, CampaignForm, SequenceEditor, LeadSelector |
| `components/leads` | LeadTable, LeadRow, LeadFilters, ApolloSearch, CSVUpload |
| `components/inbox` | ThreadList, ThreadView, MessageBubble, AIDraftActions |
| `components/agent` | AgentHeader, ChatMessages, ChatInput, QuickActions |
| `components/voice` | CallHistory, CallCard, VoiceCampaignForm |
| `components/analytics` | BarChart, LineChart, FunnelChart, CampaignPerformance |
| `components/billing` | PlanCard, UsageMeter |
| `components/settings` | SettingsCard, ToneSelector, ConnectedAccounts |
| `components/support` | TicketList, MessageThread |
| `components/admin` | OrgTable, UserTable, CampaignTable, AdminMetrics |

#### Other Frontend Folders

| Folder | Purpose |
|--------|---------|
| `lib` | API client, auth helpers, PostHog init, Stripe init, formatting utilities |
| `hooks` | useAuth, useOrganization, useCampaigns, useLeads, useInbox, useCalls |
| `providers` | AuthProvider, QueryProvider |

#### Frontend Page to API Mapping

| Page | API Endpoints |
|------|---------------|
| `/login` | `POST /api/auth/login` |
| `/signup` | `POST /api/auth/signup` |
| `/forgot-password` | `POST /api/auth/forgot-password` |
| `/onboarding` | `POST /api/onboarding` |
| `/dashboard` | `GET /api/dashboard` |
| `/agent` | `POST /api/ai/*` |
| `/prospects` | `GET /api/leads`, `POST /api/leads/apollo-search`, `POST /api/leads/csv-upload` |
| `/campaigns` | `GET /api/campaigns` |
| `/campaigns/new` | `POST /api/campaigns`, `POST /api/leads/apollo-search`, `POST /api/leads/apollo-enrich` |
| `/campaigns/[id]` | `GET /api/campaigns/:id`, `PUT /api/campaigns/:id`, `POST /api/campaigns/:id/launch` |
| `/inbox` | `GET /api/inbox`, `POST /api/inbox/:id/reply`, `POST /api/emails/:replyId/approve` |
| `/analytics` | `GET /api/analytics/campaigns`, `GET /api/analytics/calls` |
| `/billing` | `POST /api/billing/checkout`, `POST /api/billing/portal` |
| `/settings` | `GET /api/settings`, `PUT /api/settings`, `GET /api/gmail/auth-url` |
| `/support` | `GET /api/support/tickets`, `POST /api/support/tickets` |
| `/admin` | `GET /api/admin/*` |

### Backend Repo: `globonexo-backend`

#### Route Files

| File | Responsibility |
|------|----------------|
| `routes/auth.routes.ts` | Signup, login, logout, me |
| `routes/onboarding.routes.ts` | Submit onboarding |
| `routes/gmail.routes.ts` | Gmail OAuth connect/callback |
| `routes/campaigns.routes.ts` | CRUD + launch/pause campaigns |
| `routes/leads.routes.ts` | Lead CRUD, Apollo search/enrich, CSV upload |
| `routes/emails.routes.ts` | Approve/regenerate AI replies |
| `routes/inbox.routes.ts` | List threads, send manual reply |
| `routes/voice.routes.ts` | Retell agents, call retry, webhooks |
| `routes/ai.routes.ts` | Generate email, reply, voice prompt |
| `routes/billing.routes.ts` | Stripe checkout, portal, webhooks |
| `routes/dashboard.routes.ts` | Dashboard KPIs |
| `routes/settings.routes.ts` | Settings read/update |
| `routes/admin.routes.ts` | Admin org/user/campaign management |
| `routes/support.routes.ts` | Support tickets and messages |

#### Service Files

| File | Responsibility |
|------|----------------|
| `services/auth.service.ts` | Auth business logic |
| `services/onboarding.service.ts` | Onboarding + org/agent creation |
| `services/gmail.service.ts` | Gmail OAuth + token storage |
| `services/campaigns.service.ts` | Campaign lifecycle |
| `services/leads.service.ts` | Lead management |
| `services/apollo.service.ts` | Apollo API wrapper |
| `services/email.service.ts` | Send + queue emails |
| `services/inbox.service.ts` | Thread list, reply handling |
| `services/voice.service.ts` | Retell agent + call logic |
| `services/ai.service.ts` | OpenAI prompt + response handling |
| `services/billing.service.ts` | Stripe subscriptions |
| `services/dashboard.service.ts` | Dashboard data aggregation |
| `services/settings.service.ts` | Settings CRUD |
| `services/admin.service.ts` | Admin operations |
| `services/support.service.ts` | Support ticket logic |

#### Worker Files

| File | Responsibility |
|------|----------------|
| `workers/send-email.worker.ts` | Send emails via Gmail API |
| `workers/poll-inbox.worker.ts` | Poll Gmail for replies |
| `workers/schedule-call.worker.ts` | Trigger Retell outbound calls |
| `workers/enrich-leads.worker.ts` | Enrich leads via Apollo |

#### Library Files

| File | Integration |
|------|-------------|
| `lib/supabase.ts` | Database |
| `lib/redis.ts` | BullMQ queue |
| `lib/openai.ts` | Azure OpenAI |
| `lib/retell.ts` | Retell AI |
| `lib/apollo.ts` | Apollo.io |
| `lib/gmail.ts` | Gmail API |
| `lib/stripe.ts` | Stripe |
| `lib/resend.ts` | Transactional email |
| `lib/posthog.ts` | Analytics |

#### Middleware Files

| File | Responsibility |
|------|----------------|
| `middleware/auth.middleware.ts` | Require authenticated user |
| `middleware/error.middleware.ts` | Global error handler |
| `middleware/validate.middleware.ts` | Zod validation |
| `middleware/rate-limit.middleware.ts` | Rate limiting |

#### Job Files

| File | Responsibility |
|------|----------------|
| `jobs/send-email.job.ts` | Enqueue send-email jobs |
| `jobs/poll-inbox.job.ts` | Enqueue inbox polling |
| `jobs/schedule-call.job.ts` | Enqueue outbound calls |
| `jobs/enrich-leads.job.ts` | Enqueue lead enrichment |

#### Schema Files

| File | Responsibility |
|------|----------------|
| `schemas/auth.schema.ts` | Auth request validation |
| `schemas/onboarding.schema.ts` | Onboarding validation |
| `schemas/campaigns.schema.ts` | Campaign validation |
| `schemas/leads.schema.ts` | Lead validation |

#### Config and Root Files

| File | Responsibility |
|------|----------------|
| `src/config/env.ts` | Environment loader and validation |
| `src/config/constants.ts` | Plans, limits, defaults |
| `src/types/index.ts` | Shared TypeScript types |
| `src/index.ts` | Express app entry point |
| `supabase/migrations/001_initial.sql` | Initial database schema |
| `deploy.sh` | PM2 deployment script |
| `ecosystem.config.js` | PM2 process config |
| `.env.example` | Environment variable template |
| `API_CONTRACT.md` | Full API route documentation |
| `TEAM_PLAN.md` | Ownership and day-by-day plan |

### API Route Summary

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| POST | `/api/onboarding` | Submit onboarding |
| GET | `/api/gmail/auth-url` | Gmail OAuth URL |
| POST | `/api/gmail/callback` | Gmail OAuth callback |
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| POST | `/api/campaigns/:id/launch` | Launch campaign |
| POST | `/api/campaigns/:id/pause` | Pause campaign |
| GET | `/api/leads` | List leads |
| POST | `/api/leads/apollo-search` | Search Apollo |
| POST | `/api/leads/apollo-enrich` | Enrich leads |
| POST | `/api/leads/csv-upload` | Upload CSV |
| POST | `/api/emails/:replyId/approve` | Approve AI reply |
| POST | `/api/emails/:replyId/regenerate` | Regenerate AI reply |
| GET | `/api/inbox` | List inbox threads |
| POST | `/api/inbox/:id/reply` | Send manual reply |
| POST | `/api/voice/agents` | Create Retell agent |
| POST | `/api/voice/calls/:callId/retry` | Retry call |
| POST | `/webhooks/retell` | Retell webhooks |
| POST | `/api/ai/generate-email` | Generate email |
| POST | `/api/ai/generate-reply` | Generate reply |
| POST | `/api/ai/generate-voice-prompt` | Generate voice prompt |
| POST | `/api/billing/checkout` | Stripe Checkout |
| POST | `/api/billing/portal` | Stripe Portal |
| POST | `/webhooks/stripe` | Stripe webhooks |
| GET | `/api/dashboard` | Dashboard KPIs |
| GET | `/api/analytics/campaigns` | Campaign analytics |
| GET | `/api/analytics/calls` | Call analytics |
| GET / PUT | `/api/settings` | Settings |
| GET | `/api/admin/organizations` | Admin org list |
| POST | `/api/admin/organizations/:id/suspend` | Suspend org |
| POST | `/api/admin/organizations/:id/impersonate` | Impersonate org |

### BullMQ Queues

| Queue | Worker | Purpose |
|-------|--------|---------|
| `send-email` | `workers/send-email.worker.ts` | Send emails via Gmail |
| `poll-inbox` | `workers/poll-inbox.worker.ts` | Poll Gmail for replies |
| `schedule-call` | `workers/schedule-call.worker.ts` | Trigger Retell calls |
| `enrich-leads` | `workers/enrich-leads.worker.ts` | Enrich Apollo leads |

---

## 10. Data Model

See `TEAM_PLAN.md` for full SQL schema and API contract.

Core entities:
- `organizations`
- `users`
- `agent_configs`
- `campaigns`
- `leads`
- `email_sequences`
- `email_messages`
- `email_replies`
- `calls`
- `subscriptions`
- `connected_accounts`
- `support_tickets`
- `support_messages`

---

## 11. Integrations

### 10.1 Apollo.io

- **Search:** `POST /api/v1/mixed_people/api_search`
- **Enrich:** `POST /api/v1/people/match` or bulk endpoint
- **Limit:** 100 leads enriched per campaign.
- **Cost:** Platform pays for Apollo credits.

### 10.2 Retell AI

- **Create agent:** via Retell dashboard or API.
- **Outbound call:** `POST /v2/create-phone-call`
- **Webhooks:** `call_started`, `call_ended`, `call_analyzed`
- **Dynamic variables:** `retell_llm_dynamic_variables`

### 10.3 Gmail API

- **Scopes:** `gmail.send`, `gmail.readonly`, `openid`, `email`, `profile`
- **Send:** `POST /gmail/v1/users/me/messages/send`
- **List threads:** `GET /gmail/v1/users/me/threads`
- **Polling interval:** 3 minutes

### 10.4 Stripe

- **Checkout:** `checkout.session.completed`
- **Billing portal:** customer portal link
- **Webhooks:** `invoice.paid`, `subscription.deleted`

### 10.5 Azure OpenAI

- **Deployment:** GPT-4o
- **Usage:** Email generation, reply drafting, call script generation.
- **Output:** JSON for emails, plain text for voice prompts.

---

## 12. Out of Scope (v0.2)

The following are explicitly deferred:

- SMS and WhatsApp channels.
- CRM integrations (HubSpot, Salesforce, Zoho).
- Native calendar booking (use calendar link only).
- Advanced analytics and funnel visualization.
- Multi-user teams and role-based access.
- A/B testing for sequences.
- Advanced AI reply auto-send with confidence scoring.
- Custom email domains / deliverability warming.
- LinkedIn outreach.

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google OAuth verification delayed | High | Apply immediately; have fallback demo mode. |
| Apollo credit costs spike | Medium | Cap 100 leads/campaign; monitor usage. |
| Retell call quality poor | Medium | Extensive prompt testing; manual mode fallback. |
| Gmail rate limits block sends | Medium | Default 100/day cap; queue resumes next day. |
| 5-week timeline too aggressive | High | Ruthless scope enforcement; daily standups; cut non-core UI if needed. |
| Compliance complaint | High | AI disclosure, opt-out, recording consent, Terms of Service. |
| All UI screens functional scope | High | Prioritize core loop; defer polish screens to post-launch. |

---

## 14. Launch Checklist

- [ ] Stripe live mode + webhook endpoints.
- [ ] Google OAuth app verified.
- [ ] Apollo master API key active.
- [ ] Retell account + phone number purchased.
- [ ] Azure OpenAI deployment live.
- [ ] Supabase production project + RLS policies.
- [ ] GCP VM + Redis + PM2 deploy.sh working.
- [ ] Custom domain + SSL.
- [ ] Resend transactional email DNS records.
- [ ] Sentry, PostHog, UptimeRobot configured.
- [ ] Terms of Service and Privacy Policy live.
- [ ] Staging smoke tests pass.
- [ ] Admin panel accessible.
- [ ] Support chat working.
