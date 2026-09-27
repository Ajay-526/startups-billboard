# Decision Log

## ADR-001 — Modular monolith
Accepted. Start inside one Next.js application with explicit domain boundaries. Microservices are deferred until measured need.

## ADR-002 — Database owns inventory truth
Accepted. Client availability is advisory. Final availability is transactional and PostgreSQL must reject overlapping campaign ranges for a spot.

## ADR-003 — Platform-controlled billboard templates
Accepted. Advertiser assets live inside a coherent visual system. Arbitrary advertiser CSS cannot change the platform shell.

## ADR-004 — Fixed pricing before auctions
Accepted. Scarcity is represented by finite positions and campaign windows. Auctions are deferred until demand proves useful.

## ADR-005 — Motion is progressive enhancement
Accepted. CSS handles simple effects. Motion and Anime.js handle meaningful billboard moments, with reduced-motion support.

## ADR-006 — UI registries are implementation aids
Accepted. shadcn is the base convention. KokonutUI and Bklit are registry/provider sources, not runtime architecture dependencies.

## ADR-007 — No client secrets
Accepted. Only public configuration may use NEXT_PUBLIC_. Database, auth, payment, storage and analytics credentials remain server-only.