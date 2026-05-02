# InspireHope — Agent Handoff Document

> **Last updated:** 2026-04-29  
> **Project:** InspireHope Senior Center of Coachella Valley (ISCCV)  
> **Repo:** https://github.com/DesertPC/InspireHope  
> **Deployed:** https://inspirehope.vercel.app  
> **Stack:** Next.js 15.5.15 + React 19 + TypeScript (strict) + Tailwind CSS + shadcn/ui  
> **Database:** Supabase (PostgreSQL) — Project `wyolwsfdewgsndkfcrkk`  
> **Auth:** Supabase Auth with `@supabase/ssr` cookie-based SSR — **Google OAuth ONLY**  
> **Payments:** Stripe (nonprofit rate) — **FULLY ENABLED**  
> **i18n:** next-intl v4.11.0 (middleware-based routing, `en` + `es`)  

---

## 1. Quick Start (Local Dev)

```bash
npm install
# Copy env vars from .env.example → .env.local
npm run dev
# Open http://localhost:3000
```

Build check:
```bash
npm run build
```

**Important:** On Windows PowerShell, if `npm` fails with execution policy errors, use `cmd /c "npm run ..."` instead.

---

## 2. Project Structure

```
src/
├── app/[locale]/                 # next-intl locale prefix routing
│   ├── (public)/                 # Public-facing pages (marketing site)
│   │   ├── page.tsx              # Landing page
│   │   ├── about, programs, contact, apply, testimonials, login
│   │   ├── donate/
│   │   │   ├── page.tsx          # Stripe donation form (LIVE)
│   │   │   ├── success/page.tsx  # Post-payment confirmation
│   │   │   └── cancel/page.tsx   # Cancelled payment
│   │   └── layout.tsx            # Public layout
│   ├── (dashboard)/              # Dashboard (admin/volunteer)
│   │   ├── layout.tsx            # Dashboard shell with sidebar + role fetch
│   │   └── dashboard/
│   │       ├── cases/
│   │       ├── seniors/
│   │       ├── expenses/
│   │       ├── testimonials/
│   │       ├── users/page.tsx    # Admin-only — create users WITHOUT password
│   │       ├── donations/page.tsx# Admin-only
│   │       ├── reports/page.tsx  # Financial charts (Recharts)
│   │       └── settings/page.tsx # Edit profile
│   ├── donor/page.tsx            # NEW — Donor portal (view own donations)
│   ├── my-case/page.tsx          # Applicant portal (view case + documents)
│   └── layout.tsx                # Root locale layout (NextIntlClientProvider)
├── actions/
│   ├── auth.actions.ts           # signOut, updateUserLocale, updateProfile
│   ├── donations.actions.ts      # createDonationCheckout, getDonations, getMyDonations
│   ├── users.actions.ts          # createUser (auto-generates random password)
│   └── ...
├── components/
│   ├── layout/dashboard-sidebar.tsx   # Role-based filtering (admin/volunteer)
│   └── ui/                           # shadcn/ui + DataTable
├── lib/
│   ├── stripe/index.ts             # Stripe client singleton
│   ├── i18n/messages/{en,es}.json
│   └── supabase/
│       ├── server.ts               # Anon key + cookies
│       ├── admin.ts                # Service role (bypasses RLS)
│       └── auth-helpers.ts         # requireAuth(), requireAdmin()
supabase/
├── migrations/                     # 000–008
└── seed.sql
```

---

## 3. Authentication & Authorization — Google OAuth ONLY

**Email/Password login is DISABLED.** The system uses **Google OAuth exclusively**.

### 3.1 How Auth Works
- Users click "Sign in with Google" on `/login`.
- Before OAuth, any existing session is signed out to prevent "link account" conflicts.
- `oauth_locale` and `oauth_role` cookies store context for the callback.
- Callback at `/api/auth/callback` exchanges the code for a session, then **auto-provisions the user based on where their email exists**.

### 3.2 Auto-Provisioning (OAuth Callback Logic)

When a user logs in via Google, the callback checks their email in this order:

| Email found in | Role assigned | Redirects to |
|----------------|---------------|--------------|
| `profiles` table | admin / volunteer | `/dashboard` |
| `seniors` table | applicant | `/my-case` |
| `donations.donor_email` | donor | `/donor` |
| **None** | — | Rejected with `not_authorized` |

For **applicants**: the callback creates a `profile` row with `role = "applicant"` and links existing `cases` via `applicant_user_id`.

For **donors**: the callback creates a `profile` row with `role = "donor"`.

For **staff**: admins must pre-create users in the dashboard (`/dashboard/users`). The form asks for **Email, Full Name, and Role only** — no password. The backend generates a secure random password that the user never sees.

### 3.3 Roles
- `admin` — full access (Users, Donations, all CRUD).
- `volunteer` — limited access (no Users/Donations pages).
- `applicant` — accesses `/my-case` to view their case, notes, activities, and documents.
- `donor` — accesses `/donor` to view their donation history.

### 3.4 Helpers
```ts
// src/lib/supabase/auth-helpers.ts
requireAuth(locale: string)   // Redirects to /{locale}/login if no session
requireAdmin(locale: string)  // Redirects if not admin
```

---

## 4. Internationalization (next-intl v4)

- **Routing:** `/{locale}/...` where locale ∈ {en, es}. Default is `en`.
- **Messages:** Stored in `src/lib/i18n/messages/{en,es}.json`.
- **Client Components:** Use `useTranslations("namespace")`.
- **Server Components:** Use `await getTranslations("namespace")`.
- **Locale Persistence:**
  1. `LocaleSwitcher` sets `NEXT_LOCALE={code};path=/;max-age=31536000;SameSite=Lax` cookie.
  2. Calls `updateUserLocale(code)` server action to save to `profiles.locale`.
  3. `signOut()` reads `NEXT_LOCALE` cookie to redirect to correct locale login page.
  4. Migration `007_add_locale_to_profiles.sql` adds the `locale` column.

---

## 5. Database & RLS

### 5.1 Tables
`profiles`, `seniors`, `cases`, `donations`, `expenses`, `documents`, `case_notes`, `case_activities`, `testimonials`

### 5.2 RLS Critical Rule
**DO NOT use `auth.role() = 'authenticated'` in policies.** It is deprecated and fails in `WITH CHECK` contexts.

**Always use:**
```sql
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL)
```

Migration `008_fix_rls_auth_role.sql` fixes this for `seniors`, `cases`, `documents`, `case_notes`, and `case_activities`.

### 5.3 Key Policies
- `profiles`: Users see/update own profile. Admins see/manage all.
- `seniors`: All authenticated users can view/create. Admins can update/delete all; volunteers can update only their own (`created_by = auth.uid()`).
- `cases`: All authenticated users can view/create. Admins can update/delete all; assigned users can update own.
- `donations`: Admin-only management + donors can view own (`donor_email = auth.jwt() ->> 'email'`).
- `expenses`: Admin-only management. Volunteers can view expenses for assigned cases.
- `testimonials`: Public read (approved only). Authenticated users can manage in dashboard.

### 5.4 Migrations
Apply via Supabase SQL Editor:
- `007_add_locale_to_profiles.sql` — adds `profiles.locale`
- `008_fix_rls_auth_role.sql` — fixes `auth.role()` → `auth.uid() IS NOT NULL`

---

## 6. Stripe Donations — FULLY ENABLED

### 6.1 Donation Flow
1. User visits `/donate`, selects amount/type, fills info.
2. `createDonationCheckout()` (Server Action) inserts a **pending** donation record into Supabase, then creates a Stripe Checkout Session.
3. User is redirected to Stripe to complete payment.
4. On success, Stripe redirects to `/donate/success?session_id=...`.
5. Stripe webhook (`/api/stripe/webhook`) receives events and updates the donation status.

### 6.2 Webhook Events Handled
- `checkout.session.completed` → updates donation to `succeeded`
- `payment_intent.succeeded` → updates donation to `succeeded`
- `payment_intent.payment_failed` → updates donation to `failed`

### 6.3 Webhook Configuration
Set the webhook endpoint in Stripe Dashboard to:
```
POST https://inspirehope.vercel.app/api/stripe/webhook
```
Listen to:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

**Important:** The webhook uses `supabaseAdmin` (service role) to bypass RLS when updating donation records.

---

## 7. Key Patterns & Conventions

### 7.1 Server Actions
- Live in `src/actions/*.actions.ts`.
- Must be `"use server"`.
- Use `createSupabaseServerClient()` for user-scoped queries (respects RLS).
- Use `supabaseAdmin` only when bypassing RLS.

### 7.2 Forms & Dialogs
- **Critical:** When editing items with `<Select>` fields that may be `null` from DB, always coerce:
  ```tsx
  <Select defaultValue={item?.nullable_field ?? undefined}>
  ```
  Radix UI `<Select>` crashes if `defaultValue={null}`.

### 7.3 DataTable
- Generic component at `src/components/ui/data-table.tsx`.
- Supports `onRowClick?: (row: T) => void` for navigation.
- Action buttons inside rows MUST wrap with `onClick={(e) => e.stopPropagation()}`.

### 7.4 Locale-aware Paths
- **Never hardcode `/en/`** in Client Components. Extract locale from `usePathname()`:
  ```tsx
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] ?? "en";
  ```
- In Server Components, destructure `locale` from `await params`.

---

## 8. Features Implemented (Status)

| Feature | Status | Notes |
|---------|--------|-------|
| Public landing page | ✅ | Bilingual, services, testimonials, stats |
| **Stripe Donations** | ✅ | One-time + recurring, fee coverage, webhook, success/cancel pages |
| **Donor Portal** | ✅ | `/donor` — view own donation history |
| **Applicant Portal** | ✅ | `/my-case` — view case, notes, activities, documents |
| Testimonials (public submission) | ✅ | Form + admin moderation |
| Seniors CRUD | ✅ | Detail page, clickable rows |
| Cases CRUD | ✅ | Detail page, clickable rows, notes/activities |
| Expenses CRUD | ✅ | Null Select crash fixed |
| Users management | ✅ | Admin-only; **no password required** (auto-generated) |
| Donations list | ✅ | Admin-only dashboard |
| **Reports** | ✅ | Recharts bar chart (monthly donations vs expenses) |
| **Settings** | ✅ | Edit profile (name, phone) |
| OAuth (Google) | ✅ | Auto-provisions applicants/donors/staff |
| Role-based sidebar | ✅ | Filters by role (admin/volunteer) |
| i18n (en/es) | ✅ | Dashboard pages translated |
| Locale persistence | ✅ | Cookie + `profiles.locale` |
| Health check API | ✅ | `/api/health` |

---

## 9. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=sk_test_...        # or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_...   # or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://inspirehope.vercel.app
```

---

## 10. Deployment

- **Platform:** Vercel (auto-deploy on push to `master`).
- **Supabase:** Migrations applied manually via SQL Editor.
- **Stripe:** Configure webhook endpoint and live keys in production.
- **Domain:** `inspirehope.vercel.app`

---

## 11. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "new row violates low-level security policy" on INSERT | `auth.role() = 'authenticated'` in RLS policy | Replace with `auth.uid() IS NOT NULL` (migration 008) |
| Select crashes on edit | `defaultValue={null}` passed to Radix `<Select>` | Coerce: `defaultValue={value ?? undefined}` or `|| ""` |
| OAuth "link account" error | Existing session conflicts with OAuth flow | Sign out existing session before starting OAuth |
| Middleware 500 on login | `createMiddleware(routing)(request)` not awaited | Use `await createMiddleware(routing)(request)` |

---

## 12. Next Steps / TODO (for future agent)

- [ ] Add file upload for documents (Storage bucket policies ready).
- [ ] Add email notifications (e.g., when donation succeeds or case status changes).
- [ ] Improve error boundaries and loading states across dashboard.
- [ ] Add CSV export for reports.
- [ ] Consider a public donor wall (anonymous opt-in).

---

## 13. Contact & Context

- **Organization:** InspireHope Senior Center of Coachella Valley
- **Location:** 73960 Highway 111 #4, Palm Desert, CA 92260
- **Email:** careisccv@gmail.com
- **Phone:** 805-904-7882
- **EIN:** 39-4484811 | **NPI:** 1184584765
