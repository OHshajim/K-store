# KStore

Single-vendor ecommerce storefront with **manual payment confirmation**, **manual delivery status**, **Supabase**, **Google OAuth + One Tap**, **email OTP via Nodemailer**, and a **mobile-first PWA**. UI is built with the **Astryx** design system.

## Quick start (demo mode)

Without Supabase env vars the app runs in demo mode with seeded products.

```bash
bun install
bun dev
```

1. Open [http://localhost:3000](http://localhost:3000)
2. Sign in at `/login` with any email → OTP is shown on screen (and logged server-side)
3. Use `admin@kstore.local` for the vendor admin (`/admin`)

## Production setup

1. Copy `.env.example` → `.env.local` and fill values
2. Create a Supabase project and run `supabase/migrations/<timestamp>_init.sql`
3. Enable Google provider in Supabase Auth; set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` for One Tap
4. Set SMTP vars for Nodemailer (OTP + order emails)
5. Promote your user to admin:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

6. Deploy to Vercel; set the same env vars; point Supabase Auth redirect URLs to `/auth/callback`

## Stack choices (free tier)

- Cart in `localStorage` (Zustand) — no cart table
- Catalog ISR (`revalidate = 60`)
- Nodemailer on Node route handlers only
- Serwist service worker (production builds)
- Manual bank / mobile money / COD — no payment gateway fees

## Routes

| Path | Purpose |
|------|---------|
| `/` `/shop` `/product/[slug]` | Storefront |
| `/cart` `/checkout` | Cart + manual checkout |
| `/orders` `/orders/[id]` | Customer order tracking + payment proof |
| `/login` | Google OAuth + email OTP |
| `/admin` | Vendor dashboard, products, fulfillment |
