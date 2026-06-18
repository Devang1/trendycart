# TrendyCart

TrendyCart is a production-ready multi-vendor e-commerce platform built with Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, Razorpay, Cloudinary, Zustand, Recharts, Framer Motion, React Hook Form, Zod, and Nodemailer.

## Folder Structure

```txt
src/app                  App Router pages, SEO files, and API routes
src/actions              Server actions for seller/admin workflows
src/components           Layout, UI, storefront, auth, dashboard components
src/lib                  Prisma, auth, Razorpay, Cloudinary, email, validation helpers
src/store                Zustand client state
src/types                NextAuth type augmentation
prisma/schema.prisma     Complete marketplace database schema
prisma/migrations        Initial PostgreSQL migration
prisma/seed.ts           Demo admin, seller, categories, and products
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill PostgreSQL, NextAuth, Google OAuth, Razorpay, Cloudinary, and SMTP values.

3. Start PostgreSQL and create a database:

```sql
CREATE DATABASE trendycart;
```

4. Run Prisma:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Start development:

```bash
npm run dev
```

Seed users:

```txt
admin@trendycart.dev / Password@123
seller@trendycart.dev / Password@123
```

## Environment Variables

All required variables are documented in `.env.example`. For production, use a strong `NEXTAUTH_SECRET`, HTTPS `NEXTAUTH_URL`, Razorpay live keys, Cloudinary keys, and SMTP credentials.

## Razorpay

The platform creates Razorpay orders at `/api/checkout/create-order`, verifies checkout signatures at `/api/checkout/verify-payment`, accepts webhooks at `/api/razorpay/webhook`, and supports admin refunds at `/api/razorpay/refund`.

Set your Razorpay webhook URL to:

```txt
https://your-domain.com/api/razorpay/webhook
```

## Cloudinary

Authenticated sellers/admins can request signed upload parameters from `/api/cloudinary/signature`. Store returned URLs in product `images`.

## Deployment on Vercel

1. Push the project to GitHub.
2. Create a Vercel project and add all environment variables.
3. Use a managed PostgreSQL provider such as Neon, Supabase, or Vercel Postgres.
4. Set the build command to `npm run build`.
5. Run `npm run db:deploy` against production before or during deployment.
6. Configure Razorpay webhook URL and Google OAuth redirect URL:

```txt
https://your-domain.com/api/auth/callback/google
```

## Production Notes

- RBAC is enforced in middleware and server utilities for customer, seller, and admin areas.
- Payment verification uses Razorpay HMAC signature validation.
- Passwords and reset tokens are hashed with bcrypt.
- SEO includes dynamic metadata, structured product data, sitemap, robots, and optimized remote images.
- Dashboard analytics are backed by Prisma queries and Recharts visualizations.
