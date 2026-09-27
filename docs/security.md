# Security Baseline

## Controls implemented

- [x] No production secrets committed
- [x] Environment files ignored
- [x] Public configuration uses NEXT_PUBLIC_
- [x] Authentication, analytics, and creative-upload rate limiting
- [x] Zod input validation and bounded analytics payloads
- [x] Generic unexpected-error responses
- [x] Signed Razorpay webhook verification and event-id idempotency
- [x] Creative 10 MB limit and authenticated campaign ownership
- [x] Creative storage keys are random and campaign-scoped
- [x] Creative object size and magic-byte verification
- [x] Client-supplied creative public URLs are ignored
- [x] Dependency security scripts
- [x] Next.js and React security patch upgrades

## Remaining production hardening

- [ ] Replace process-local rate limiting with shared Redis/edge limiting
- [ ] Commit a lockfile and run npm audit in CI
- [ ] CSP/security headers
- [ ] Image decode/dimension validation
- [ ] Malware scanning policy if upload exposure expands
- [ ] E2E/security regression tests
- [ ] Database-level inventory constraints and transaction retries
- [ ] Enforce HTTPS at deployment/CDN
- [ ] Data retention/deletion workflow
- [ ] Production legal/privacy review

The current rate limiter is deliberately lightweight for development and single-instance deployments. It must not be treated as the final distributed rate-limiting mechanism.
