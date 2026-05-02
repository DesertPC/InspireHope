# InspireHope — Agent Handoff Document

> **Last updated:** 2026-04-29  
> **Project:** InspireHope Senior Center of Coachella Valley (ISCCV)  
> **Repo:** https://github.com/DesertPC/InspireHope  
> **Deployed:** https://inspirehope.vercel.app  
> **Stack:** Next.js 15.5.15 + React 19 + TypeScript (strict) + Tailwind CSS + shadcn/ui  
> **Database:** Supabase (PostgreSQL) — Project `wyolwsfdewgsndkfcrkk`  
> **Auth:** Supabase Auth with `@supabase/ssr` cookie-based SSR  
> **Payments:** Stripe (nonprofit rate)  
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
│   │   ├── about, programs, contact, donate, apply, testimonials, login
│   │   └── layout.tsx            # Public layout
│   ├── (dashboard)/              # Dashboard (admin/volunteer)
│   │   ├── layout.tsx            # Dashboard shell with sidebar + role fetch
│   │   └── dashboard/
│   │       ├── cases/
│   │       │   ├── page.tsx      # Cases list (clickable rows → detail)
│   │       │   └── [id]/page.tsx # Case detail (existing)
│   │       ├── seniors/
│   │       │   ├── page.tsx      # Seniors list (clickable rows → detail)
│   │       │   ├── [id]/page.tsx # Senior detail (NEW)
│   │       │   └── senior-form.tsx
│   │       ├── expenses/
│   │       │   ├── page.tsx
│   │       │   └── expense-form.tsx
│   │       ├── testimonials/
│   │       │   ├── page.tsx
│   │       │   └── testimonial-form.tsx
│   │       ├── users/page.tsx    # Admin-only (Server Component)
│   │       ├── donations/page.tsx# Admin-only (Server Component)
│   │       ├── reports/page.tsx
│   │       └── settings/page.tsx
│   └── layout.tsx                # Root locale layout (NextIntlClientProvider)
├── actions/                      # Server Actions
│   ├── auth.actions.ts           # signOut, updateUserLocale
│   ├── seniors.actions.ts        # CRUD + getSenior
│   ├── cases.actions.ts
│   ├── expenses.actions.ts
│   ├── donations.actions.ts      # Admin-only, uses Stripe
│   ├── users.actions.ts          # Admin-only
│   └── testimonials.actions.ts
├── components/
│   ├── layout/dashboard-sidebar.tsx   # Role-based filtering
│   ├── locale-switcher.tsx           # Sets NEXT_LOCALE cookie + profile.locale
│   └── ui/                           # shadcn/ui components + DataTable
├── lib/
│   ├── i18n/
│   │   ├── config.ts               # { locales: ["en","es"], defaultLocale: "en" }
│   │   ├── routing.ts              # defineRouting
│   │   ├── request.ts              # getRequestConfig
│   │   └── messages/
│   │       ├── en.json
│   │       └── es.json
│   ├── supabase/
│   │   ├── server.ts               # createSupabaseServerClient (anon key, cookies)
│   │   ├── admin.ts                # supabaseAdmin (service role, bypasses RLS)
│   │   └── auth-helpers.ts         # requireAuth(), requireAdmin()
│   ├── validations/                # Zod schemas
│   └── utils.ts
├── hooks/
├── types/
supabase/
├── migrations/                     # Numbered SQL migrations (000–008)
├── seed.sql
└── fix_permissions.sql
```

---

## 3. Authentication & Authorization

### 3.1 How Auth Works
- **Client:** `useSupabaseClient()` hook creates a browser-side Supabase client.
- **Server Actions:** Use `createSupabaseServerClient()` (anon key + cookies).
- **Admin/Bypass RLS:** Use `supabaseAdmin` (service role key). **Never expose to client.**
- **Middleware (`middleware.ts`):** Combines `next-intl` middleware + Supabase session refresh via `createServerClient`.

### 3.2 Login Methods
1. **Email/Password:** Standard Supabase auth.
2. **Google OAuth:**
   - Before OAuth, existing session is signed out to prevent "link account" conflicts.
   - `oauth_locale` and `oauth_role` cookies store context.
   - Callback at `/api/auth/callback` exchanges code, then checks if the email exists in `profiles`.
   - **Unknown OAuth users are rejected** with: *"You are not authorized to access this system."*
   - Only pre-existing `profiles` emails can log in via Google.

### 3.3 Roles
- `admin` — full access (Users, Donations, all CRUD).
- `volunteer` — limited access (no Users/Donations pages).
- The `DashboardSidebar` filters routes by role. Pages also enforce server-side.

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
  1. `LocaleSwitcher` sets `NEXT_LOCALE={code};path=/;max-age=31536000` cookie.
  2. Calls `updateUserLocale(code)` server action to save to `profiles.locale`.
  3. `signOut()` reads `NEXT_LOCALE` cookie to redirect to correct locale login page.
  4. Migration `007_add_locale_to_profiles.sql` adds the `locale` column.

---

## 5. Database & RLS

### 5.1 Tables
`profiles`, `seniors`, `cases`, `donations`, `expenses`, `documents`, `case_notes`, `case_activities`, `testimonials`

### 5.2 RLS Critical Rule
**DO NOT use `auth.role() = 'authenticated'` in policies.** It is deprecated and fails in `WITH CHECK` contexts (causes "new row violates low-level security policy" on INSERT).

**Always use:**
```sql
-- Correct
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL)

-- WRONG — do not use
USING (auth.role() = 'authenticated')
```

Migration `008_fix_rls_auth_role.sql` fixes this for `seniors`, `cases`, `documents`, `case_notes`, and `case_activities`.

### 5.3 Key Policies
- `profiles`: Users see/update own profile. Admins see/manage all.
- `seniors`: All authenticated users can view/create. Admins can update/delete all; volunteers can update only their own (`created_by = auth.uid()`).
- `cases`: All authenticated users can view/create. Admins can update/delete all; assigned users can update own.
- `donations`: Admin-only management.
- `expenses`: Admin-only management. Volunteers can view expenses for assigned cases.
- `testimonials`: Public read (approved only). Authenticated users can manage in dashboard.

### 5.4 Migrations
Apply new migrations via Supabase SQL Editor (or `npx supabase db push` if CLI is configured):
- `007_add_locale_to_profiles.sql` — adds `profiles.locale`
- `008_fix_rls_auth_role.sql` — fixes `auth.role()` → `auth.uid() IS NOT NULL`

---

## 6. Key Patterns & Conventions

### 6.1 Server Actions
- Live in `src/actions/*.actions.ts`.
- Must be `"use server"`.
- Use `createSupabaseServerClient()` for user-scoped queries (respects RLS).
- Use `supabaseAdmin` only when bypassing RLS (e.g., `getUsers`, `getDonations`, creating users via `auth.admin.createUser`).

### 6.2 Forms & Dialogs
- Dashboard forms are typically inside `Dialog` components (shadcn/ui).
- Pattern: Parent page holds `formOpen`, `editingItem` state. Form receives `open`, `onOpenChange`, `item`, `onSuccess`.
- **Critical:** When editing items with `<Select>` fields that may be `null` from DB, always coerce:
  ```tsx
  <Select defaultValue={item?.nullable_field ?? undefined}>
  ```
  Radix UI `<Select>` crashes if `defaultValue={null}`.

### 6.3 DataTable
- Generic component at `src/components/ui/data-table.tsx`.
- Supports `onRowClick?: (row: T) => void` for navigation.
- Action buttons inside rows MUST wrap with `onClick={(e) => e.stopPropagation()}` to prevent row click from firing.

### 6.4 Clickable Rows
- Implemented on Cases and Seniors tables.
- Cases navigate to `/[locale]/dashboard/cases/${row.id}`.
- Seniors navigate to `/[locale]/dashboard/seniors/${row.id}`.

---

## 7. Features Implemented (Status)

| Feature | Status | Notes |
|---------|--------|-------|
| Public landing page | ✅ | Services, testimonials, stats, contact |
| Donations (Stripe Checkout) | ✅ | One-time + recurring, fee coverage |
| Testimonials (public submission) | ✅ | Form at `/testimonials`, admin review in dashboard |
| Testimonials (dashboard CRUD) | ✅ | Approve/reject/delete/add manually |
| Seniors CRUD | ✅ | Detail page added (`[id]`) |
| Cases CRUD | ✅ | Detail page exists (`[id]`) |
| Expenses CRUD | ✅ | Fixed null Select crash |
| Users management | ✅ | Admin-only; create via `auth.admin.createUser` |
| Donations list | ✅ | Admin-only |
| OAuth (Google) | ✅ | Pre-existing profiles required |
| Role-based sidebar | ✅ | Volunteers hide Users/Donations |
| i18n (en/es) | ✅ | Dashboard pages translated |
| Locale persistence | ✅ | Cookie + `profiles.locale` |
| Health check API | ✅ | `/api/health` |
| Debug OAuth API | ✅ | `/api/debug-oauth` |

---

## 8. Environment Variables

See `.env.example`. Key vars:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 9. Deployment

- **Platform:** Vercel (connected to GitHub repo).
- **Env vars:** Set in Vercel dashboard.
- **Supabase:** Migrations applied manually via SQL Editor.
- **Domain:** `inspirehope.vercel.app`

---

## 10. Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "new row violates low-level security policy" on INSERT | `auth.role() = 'authenticated'` in RLS policy | Replace with `auth.uid() IS NOT NULL` (see migration 008) |
| Select crashes on edit | `defaultValue={null}` passed to Radix `<Select>` | Coerce: `defaultValue={value ?? undefined}` or `|| ""` |
| OAuth "link account" error | Existing session conflicts with OAuth flow | Sign out existing session before starting OAuth |
| Form state not resetting on edit | React reuses component instance | Add `key={editingItem?.id || "new"}` to dialog form |

---

## 11. Next Steps / TODO (for future agent)

- [ ] Translate the new Senior detail page (`seniors/[id]/page.tsx`) — currently hardcoded in English.
- [ ] Add `onRowClick` to Expenses or Testimonials tables if desired (pattern already exists).
- [ ] Complete Reports page with real charts (Recharts already in dependencies).
- [ ] Add Settings page functionality (profile update, org settings).
- [ ] Add email notifications (e.g., when testimonial status changes).
- [ ] Consider adding `applicant` role for the "My Case" self-service portal.
- [ ] Add file upload for documents (Storage bucket policies ready).
- [ ] Improve error boundaries and loading states across dashboard.

---

## 12. Contact & Context

- **Organization:** InspireHope Senior Center of Coachella Valley
- **Location:** 73960 Highway 111 #4, Palm Desert, CA 92260
- **Email:** careisccv@gmail.com
- **Phone:** 805-904-7882
- **EIN:** 39-4484811 | **NPI:** 1184584765
