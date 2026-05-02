# InspireHope Senior Center

[![Deploy on Vercel](https://img.shields.io/badge/Vercel-deployed-blue?logo=vercel)](https://inspirehope.vercel.app)

**InspireHope Senior Center of Coachella Valley (ISCCV)** is a 501(c)(3) nonprofit management platform built with Next.js 15, Supabase, and Stripe.

**Live site:** [https://inspirehope.vercel.app](https://inspirehope.vercel.app)

---

## Features

- **Public Website** — Bilingual (English/Spanish) landing page with services, testimonials, and contact
- **Online Donations** — Stripe Checkout integration (one-time and recurring) with fee coverage option
- **Testimonials System** — Public submission form + admin moderation dashboard
- **Senior & Case Management** — Full CRUD for beneficiaries and their support cases
- **Expense Tracking** — Categorized expense logging linked to cases
- **User Management** — Role-based access control (`admin` / `volunteer`)
- **Financial Reporting** — Donations vs expenses overview

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router, React 19)
- **Language:** TypeScript (strict mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Database:** [Supabase](https://supabase.com) (PostgreSQL with RLS)
- **Auth:** Supabase Auth (cookie-based SSR via `@supabase/ssr`)
- **Payments:** [Stripe](https://stripe.com)
- **i18n:** [next-intl](https://next-intl-docs.vercel.app) v4

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- A Stripe account (test mode for development)

### Installation

```bash
npm install
```

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Setup

1. Run the migrations in `supabase/migrations/` in order (001, 002, ...) via the Supabase SQL Editor.
2. Apply `supabase/fix_permissions.sql` to grant table privileges.
3. Optionally run `supabase/seed.sql` to populate sample data.

> **Note:** Recent Supabase versions require `auth.uid() IS NOT NULL` instead of `auth.role() = 'authenticated'` in RLS policies. Migration `008_fix_rls_auth_role.sql` applies this fix.

---

## Deployment

This project is deployed on **Vercel**.

1. Push to the GitHub repo.
2. Vercel auto-deploys on every push to `master`.
3. Set all environment variables in the Vercel dashboard.

---

## Project Info

- **Organization:** InspireHope Senior Center of Coachella Valley
- **Address:** 73960 Highway 111 #4, Palm Desert, CA 92260
- **Email:** careisccv@gmail.com
- **Phone:** 805-904-7882
- **EIN:** 39-4484811

---

## Agent Documentation

For detailed technical context intended for AI agents continuing this project, see [`AGENTS.md`](./AGENTS.md).
