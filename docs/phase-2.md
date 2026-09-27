# Phase 2 — Data and Campaign Foundation

## Goal
Move the billboard from static demo data toward a real marketplace foundation.

## Implemented
- PostgreSQL relational persistence layer.
- Prisma ORM with the ESM-first `prisma-client` generator.
- User/company ownership model.
- Scarce ranked billboard spots with tier and availability state.
- Campaign lifecycle states.
- Creative approval state and metadata.
- Payment records separated from campaign state.
- Append-oriented analytics event model.
- Indexes for spot/date availability and event reporting.
- Singleton Prisma client for Next.js development.

## Domain rules
1. A Spot represents a scarce numbered position.
2. A Campaign reserves a spot for a time window.
3. A company may run multiple campaigns over time.
4. Payment state does not directly imply campaign state.
5. Creative approval is separate from payment and scheduling.
6. Events should avoid unnecessary personal data.
7. Date overlap protection must be enforced transactionally before a campaign becomes scheduled/live.

## Next
- Authentication and company onboarding.
- Real spot availability queries.
- Campaign creation and validation.
- Creative upload validation.
- Payment provider and signed webhooks.
- Admin review workflow.
- Analytics ingestion and dashboard.
