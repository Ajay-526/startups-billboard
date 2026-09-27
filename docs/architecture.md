# Architecture

## Runtime
Next.js App Router, React, TypeScript and Tailwind CSS v4. PostgreSQL plus Prisma or Drizzle arrives in Phase 2. S3-compatible storage and CDN handle public creative assets.

## Modules
auth, companies, inventory, campaigns, creatives, payments, analytics and admin.

## Rendering
Public pages are server-rendered. Interactive billboard effects are isolated in client components. Below-the-fold media is lazy-loaded.

## Inventory correctness
A campaign occupies a half-open time range. PostgreSQL should reject overlapping ranges for the same spot. Availability is rechecked immediately before payment.

## Payment correctness
Payment creation uses an application-generated idempotency key. Signed webhooks are verified and processed idempotently. The browser never marks a campaign paid.

## Security
HTTPS, CSP/security headers, server-only secrets, upload validation, admin authorization, rate limits, safe rendering and audit logs.

## Performance
Keep homepage client JS small, use optimized images, CDN caching, transform/opacity animation, no default giant video, and reduced-motion support.

## UI
shadcn conventions plus local primitives. KokonutUI-inspired interaction patterns and Motion/Anime.js for selected billboard moments. Bklit is reserved for useful analytics visualization later.