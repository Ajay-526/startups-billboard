# The Startup Billboard

Premium digital billboard for startups and brands. Advertisers buy scarce positions, not directory listings.

## Stack

- Next.js 15 App Router + React 19 + Tailwind CSS 4
- PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- Razorpay payments
- S3-compatible creative uploads

## Local setup

```bash
cp .env.example .env
# set DATABASE_URL to a PostgreSQL connection string
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Scripts

- `npm run dev` — development server
- `npm run typecheck` — TypeScript
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm run db:seed` — seed hero/prime/standard spots

The homepage and discover pages fall back to sample creatives if the database is not configured.
