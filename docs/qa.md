# QA Tracking — Phase 1

## Automated
- [ ] npm install
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run build

## Acceptance
- [x] Product intent visible in hero
- [x] #1 is visually dominant
- [x] Single primary conversion CTA
- [x] Billboard links are semantic
- [x] Mobile navigation does not depend on hover
- [x] Keyboard focus visible
- [x] Reduced motion path exists
- [x] 404 page
- [x] Privacy and terms reachable
- [x] Cookie choice persists
- [x] Sitemap and robots generated
- [x] No frontend secrets in source
- [ ] Full broken-link scan
- [ ] Final color-contrast audit

## Performance
- [ ] Lighthouse mobile
- [ ] LCP
- [ ] CLS
- [ ] INP
- [ ] JS payload review
- [ ] Image compression review

## Known Phase 1 limitation
The billboard imagery is intentionally CSS/typography driven for speed. Generated brand/illustration assets should be introduced once the visual direction is approved, rather than shipping large raster assets prematurely.