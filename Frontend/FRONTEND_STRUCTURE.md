# Globonexo Sales AI — Frontend Structure Guide

**Goal:** Ensure every page is properly structured in the Next.js App Router, with clear component boundaries and API wiring.

**Owner:** Poojitha
**Reviewer:** Simha Teja

---

## 1. App Router Structure

**Physical route files have been created as placeholders in `frontend/app/`.** Poojitha migrates the prototype code into these files.

```
globonexo-frontend/
├── app/
│   ├── (marketing)/
│   │   ├── layout.jsx              # Public layout (no auth required)
│   │   ├── page.jsx                # Landing page (current app/page.jsx)
│   │   ├── pricing/page.jsx        # Pricing page
│   │   ├── terms/page.jsx          # Terms of Service
│   │   └── privacy/page.jsx        # Privacy Policy
│   ├── (auth)/
│   │   ├── layout.jsx              # Auth layout (clean, centered)
│   │   ├── login/page.jsx          # Login
│   │   ├── signup/page.jsx         # Signup
│   │   └── forgot-password/page.jsx # Forgot password
│   ├── (app)/
│   │   ├── layout.jsx              # App shell (sidebar + header)
│   │   ├── dashboard/page.jsx      # Dashboard
│   │   ├── agent/page.jsx          # AI Agent chat
│   │   ├── prospects/page.jsx      # Leads / prospects table
│   │   ├── pipeline/page.jsx       # Pipeline board
│   │   ├── campaigns/page.jsx      # Campaigns list
│   │   ├── campaigns/new/page.jsx  # Create campaign
│   │   ├── campaigns/[id]/page.jsx # Campaign detail/edit
│   │   ├── inbox/page.jsx          # Inbox
│   │   ├── meetings/page.jsx       # Meetings list
│   │   ├── analytics/page.jsx      # Analytics
│   │   ├── billing/page.jsx        # Billing / plans
│   │   ├── settings/page.jsx       # Settings
│   │   └── support/page.jsx        # Support chat
│   ├── admin/
│   │   ├── layout.jsx              # Admin layout
│   │   ├── page.jsx                # Admin dashboard
│   │   ├── organizations/page.jsx  # Organizations list
│   │   ├── users/page.jsx          # Users list
│   │   ├── campaigns/page.jsx      # All campaigns
│   │   └── support/page.jsx        # Support tickets
│   ├── globals.css
│   └── layout.jsx                  # Root layout (fonts, metadata)
├── components/
│   ├── ui/                         # Reusable UI primitives
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Toggle.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── Icon.jsx
│   │   └── Modal.jsx
│   ├── layout/                     # Layout components
│   │   ├── AppShell.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── AuthAside.jsx
│   │   └── LandingNav.jsx
│   ├── auth/                       # Auth-specific
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   └── ForgotPasswordForm.jsx
│   ├── onboarding/                 # Onboarding wizard
│   │   ├── OnboardingLayout.jsx
│   │   ├── Step1About.jsx
│   │   ├── Step2ICP.jsx
│   │   └── Step3Agent.jsx
│   ├── dashboard/                  # Dashboard widgets
│   │   ├── KPICard.jsx
│   │   ├── ActivityFeed.jsx
│   │   ├── TaskList.jsx
│   │   ├── WeeklyGoal.jsx
│   │   └── NextMeeting.jsx
│   ├── campaigns/                  # Campaign components
│   │   ├── CampaignList.jsx
│   │   ├── CampaignCard.jsx
│   │   ├── CampaignForm.jsx
│   │   ├── SequenceEditor.jsx
│   │   └── LeadSelector.jsx
│   ├── leads/                      # Lead components
│   │   ├── LeadTable.jsx
│   │   ├── LeadRow.jsx
│   │   ├── LeadFilters.jsx
│   │   ├── ApolloSearch.jsx
│   │   └── CSVUpload.jsx
│   ├── inbox/                      # Inbox components
│   │   ├── ThreadList.jsx
│   │   ├── ThreadView.jsx
│   │   ├── MessageBubble.jsx
│   │   └── AIDraftActions.jsx
│   ├── agent/                      # AI agent chat
│   │   ├── AgentHeader.jsx
│   │   ├── ChatMessages.jsx
│   │   ├── ChatInput.jsx
│   │   └── QuickActions.jsx
│   ├── voice/                      # Voice call components
│   │   ├── CallHistory.jsx
│   │   ├── CallCard.jsx
│   │   └── VoiceCampaignForm.jsx
│   ├── analytics/                  # Analytics charts
│   │   ├── BarChart.jsx
│   │   ├── LineChart.jsx
│   │   ├── FunnelChart.jsx
│   │   └── CampaignPerformance.jsx
│   ├── billing/                    # Billing components
│   │   ├── PlanCard.jsx
│   │   └── UsageMeter.jsx
│   ├── settings/                   # Settings components
│   │   ├── SettingsCard.jsx
│   │   ├── ToneSelector.jsx
│   │   └── ConnectedAccounts.jsx
│   ├── support/                    # Support chat
│   │   ├── TicketList.jsx
│   │   └── MessageThread.jsx
│   └── admin/                      # Admin components
│       ├── OrgTable.jsx
│       ├── UserTable.jsx
│       ├── CampaignTable.jsx
│       └── AdminMetrics.jsx
├── lib/
│   ├── api.js                      # Axios instance + API helpers
│   ├── auth.js                     # Auth cookie handling
│   ├── posthog.js                  # PostHog init
│   ├── stripe.js                   # Stripe init
│   └── utils.js                    # Formatting, timezone helpers
├── hooks/
│   ├── useAuth.js                  # Auth state hook
│   ├── useOrganization.js          # Org state hook
│   ├── useCampaigns.js             # Campaigns data hook
│   ├── useLeads.js                 # Leads data hook
│   ├── useInbox.js                 # Inbox data hook
│   └── useCalls.js                 # Calls data hook
├── providers/
│   ├── AuthProvider.jsx            # Auth context
│   └── QueryProvider.jsx           # React Query / SWR provider (optional)
├── public/
│   └── uploads/                    # Static assets
└── package.json
```

---

## 2. Route Mapping from Prototype

| Prototype Screen | Next.js Route | File to Create |
|------------------|---------------|----------------|
| Landing page | `/` | `app/(marketing)/page.jsx` |
| Login | `/login` | `app/(auth)/login/page.jsx` |
| Signup | `/signup` | `app/(auth)/signup/page.jsx` |
| Forgot password | `/forgot-password` | `app/(auth)/forgot-password/page.jsx` |
| Onboarding wizard | `/onboarding` | `app/(app)/onboarding/page.jsx` or wizard modal |
| Celebration | `/onboarding/celebration` | `app/(app)/onboarding/celebration/page.jsx` |
| Dashboard | `/dashboard` | `app/(app)/dashboard/page.jsx` |
| AI Agent chat | `/agent` | `app/(app)/agent/page.jsx` |
| Prospects | `/prospects` | `app/(app)/prospects/page.jsx` |
| Pipeline | `/pipeline` | `app/(app)/pipeline/page.jsx` |
| Campaigns list | `/campaigns` | `app/(app)/campaigns/page.jsx` |
| New campaign | `/campaigns/new` | `app/(app)/campaigns/new/page.jsx` |
| Campaign detail | `/campaigns/[id]` | `app/(app)/campaigns/[id]/page.jsx` |
| Inbox | `/inbox` | `app/(app)/inbox/page.jsx` |
| Meetings | `/meetings` | `app/(app)/meetings/page.jsx` |
| Analytics | `/analytics` | `app/(app)/analytics/page.jsx` |
| Billing | `/billing` | `app/(app)/billing/page.jsx` |
| Settings | `/settings` | `app/(app)/settings/page.jsx` |
| Support chat | `/support` | `app/(app)/support/page.jsx` |
| Admin dashboard | `/admin` | `app/admin/page.jsx` |

---

## 3. Component Extraction Plan

### Phase 1 — Layout + Auth (Week 1)

Extract from `GlobonexoPrototype.jsx`:

1. `Logo` → `components/ui/Logo.jsx`
2. `Icon` → `components/ui/Icon.jsx`
3. `Avatar` → `components/ui/Avatar.jsx`
4. `Button` variants → `components/ui/Button.jsx`
5. `Field` (input) → `components/ui/Input.jsx`
6. `AuthAside` → `components/layout/AuthAside.jsx`
7. `Login` screen → `components/auth/LoginForm.jsx` + `app/(auth)/login/page.jsx`
8. `Signup` screen → `components/auth/SignupForm.jsx` + `app/(auth)/signup/page.jsx`
9. `Forgot` screen → `components/auth/ForgotPasswordForm.jsx` + `app/(auth)/forgot-password/page.jsx`
10. `AppShell` → `components/layout/AppShell.jsx`
11. `Sidebar` → `components/layout/Sidebar.jsx`
12. `TopBar` → `components/layout/TopBar.jsx`

### Phase 2 — Onboarding (Week 1)

1. `OnboardingWizard` → `components/onboarding/OnboardingLayout.jsx`
2. `Step0` → `components/onboarding/Step1About.jsx`
3. `Step1` → merge into Step1About or keep as separate
4. `Step2` → `components/onboarding/Step2ICP.jsx`
5. `Step3` + `Step4` → `components/onboarding/Step3Agent.jsx`
6. `CelebrationScreen` → `app/(app)/onboarding/celebration/page.jsx`

### Phase 3 — Dashboard (Week 4)

1. `Dashboard` → `app/(app)/dashboard/page.jsx`
2. KPI cards → `components/dashboard/KPICard.jsx`
3. Activity feed → `components/dashboard/ActivityFeed.jsx`
4. Tasks → `components/dashboard/TaskList.jsx`
5. Weekly goal → `components/dashboard/WeeklyGoal.jsx`
6. Next meeting → `components/dashboard/NextMeeting.jsx`

### Phase 4 — Campaigns + Leads (Week 2)

1. `Campaigns` → `app/(app)/campaigns/page.jsx`
2. Campaign cards → `components/campaigns/CampaignCard.jsx`
3. Campaign form → `components/campaigns/CampaignForm.jsx`
4. Sequence editor → `components/campaigns/SequenceEditor.jsx`
5. `Prospects` → `app/(app)/prospects/page.jsx`
6. Lead table → `components/leads/LeadTable.jsx`
7. Apollo search UI → `components/leads/ApolloSearch.jsx`
8. CSV upload → `components/leads/CSVUpload.jsx`

### Phase 5 — Inbox (Week 2)

1. `Inbox` → `app/(app)/inbox/page.jsx`
2. Thread list → `components/inbox/ThreadList.jsx`
3. Thread view → `components/inbox/ThreadView.jsx`
4. Message bubble → `components/inbox/MessageBubble.jsx`
5. AI draft actions → `components/inbox/AIDraftActions.jsx`

### Phase 6 — Voice + Analytics + Billing + Settings (Weeks 3-4)

1. `AgentWorkspace` → `app/(app)/agent/page.jsx`
2. `Pipeline` → `app/(app)/pipeline/page.jsx`
3. `Meetings` → `app/(app)/meetings/page.jsx`
4. `Analytics` → `app/(app)/analytics/page.jsx`
5. `Billing` → `app/(app)/billing/page.jsx`
6. `Settings` → `app/(app)/settings/page.jsx`
7. Support chat → `app/(app)/support/page.jsx`
8. Admin panel → `app/admin/page.jsx`

---

## 4. API Wiring per Page

| Page | API Endpoints Used |
|------|-------------------|
| `/login` | `POST /api/auth/login` |
| `/signup` | `POST /api/auth/signup` |
| `/forgot-password` | `POST /api/auth/forgot-password` |
| `/onboarding` | `POST /api/onboarding`, `PUT /api/onboarding` |
| `/dashboard` | `GET /api/dashboard`, `GET /api/auth/me` |
| `/agent` | `GET /api/auth/me`, `POST /api/ai/*` (optional) |
| `/prospects` | `GET /api/leads`, `POST /api/leads/apollo-search`, `POST /api/leads/csv-upload` |
| `/pipeline` | `GET /api/leads` |
| `/campaigns` | `GET /api/campaigns` |
| `/campaigns/new` | `POST /api/campaigns`, `POST /api/leads/apollo-search`, `POST /api/leads/apollo-enrich` |
| `/campaigns/[id]` | `GET /api/campaigns/:id`, `PUT /api/campaigns/:id`, `POST /api/campaigns/:id/launch`, `POST /api/campaigns/:id/pause` |
| `/inbox` | `GET /api/inbox`, `POST /api/inbox/:id/reply`, `POST /api/emails/:replyId/approve`, `POST /api/emails/:replyId/regenerate` |
| `/meetings` | `GET /api/calls` or static/mock |
| `/analytics` | `GET /api/analytics/campaigns`, `GET /api/analytics/calls` |
| `/billing` | `POST /api/billing/checkout`, `POST /api/billing/portal` |
| `/settings` | `GET /api/settings`, `PUT /api/settings`, `GET /api/gmail/auth-url`, `DELETE /api/gmail/disconnect` |
| `/support` | `GET /api/support/tickets`, `POST /api/support/tickets`, `POST /api/support/tickets/:id/messages` |
| `/admin` | `GET /api/admin/organizations`, `GET /api/admin/users`, `GET /api/admin/campaigns`, `POST /api/admin/organizations/:id/suspend`, `POST /api/admin/organizations/:id/impersonate`, `GET /api/admin/metrics` |

---

## 5. State Management

Use **React Context** for v0.1 (simplest for single-user org):

### AuthProvider

```jsx
// providers/AuthProvider.jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setUser(res.data.user);
        setOrganization(res.data.organization);
      })
      .catch(() => {
        setUser(null);
        setOrganization(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    setOrganization(res.data.organization);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider value={{ user, organization, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### API Client

```js
// lib/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

---

## 6. Migration Steps from Prototype

1. **Install dependencies:**
   ```bash
   npm install axios date-fns date-fns-tz posthog-js @stripe/stripe-js
   ```

2. **Create folder structure** as shown in Section 1.

3. **Extract reusable UI first:**
   - `Logo`, `Icon`, `Avatar`, `Button`, `Input`, `Badge`

4. **Extract layouts:**
   - `AuthAside`, `AppShell`, `Sidebar`, `TopBar`

5. **Create route pages** one by one, copying logic from `GlobonexoPrototype.jsx`.

6. **Replace hardcoded data** with API calls.

7. **Delete `GlobonexoPrototype.jsx`** once all screens are migrated.

8. **Remove `TweaksPanel`** and all tweak code.

---

## 7. File Naming Rules

- Pages: `page.jsx` inside route folders.
- Layouts: `layout.jsx` inside route group folders.
- Components: PascalCase `.jsx` files.
- Hooks: camelCase `use*.js` files.
- Utils: camelCase `.js` files.
- Keep all CSS in `app/globals.css` for v0.1.

---

## 8. Critical Reminders

- Every page must handle **loading**, **empty**, and **error** states.
- Every form must use **Zod validation** or HTML5 validation.
- All API calls go through `lib/api.js` with `withCredentials: true`.
- No secrets in frontend code except publishable keys.
- Remove all hardcoded demo data before public launch.
