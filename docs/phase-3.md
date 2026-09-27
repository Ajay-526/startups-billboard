# Phase 3 — Advertiser Experience

## Goal

Turn the marketplace from a public board into a real acquisition flow for advertisers.

## Product flow

1. Visitor selects a billboard position.
2. Visitor chooses campaign dates.
3. System calculates the campaign amount from the selected spot.
4. Advertiser creates/signs into an account.
5. Advertiser creates or selects a company.
6. Advertiser provides campaign copy and creative.
7. System validates the campaign and reserves the spot window.
8. Creative enters review before activation.
9. Payment is handled separately from campaign lifecycle.
10. Approved campaigns become scheduled/live at the requested window.

## Implemented foundation

- Active spot repository queries.
- Campaign repository queries.
- Campaign input validation with Zod.
- Campaign creation service built on transactional spot reservation.
- Public GET /api/spots endpoint.
- Date-aware spot availability through GET /api/spots?start=...&end=....

## Next implementation order

### 3.1 Authentication
- Add secure account/session handling.
- Protect advertiser mutations.
- Never accept ownerId from an untrusted client.

### 3.2 Company onboarding
- Create company.
- Associate authenticated user with company.
- Edit company profile.
- Brand identity fields: name, slug, logo, website, description, accent.

### 3.3 Campaign builder
- Position selection.
- Start/end dates.
- Live price calculation.
- Campaign headline/subheadline.
- Creative upload and preview.

### 3.4 Reservation
- Re-check availability inside the transaction.
- Create campaign as DRAFT.
- Move to PENDING_REVIEW only after required campaign data is complete.

## Security rules

- Authentication must establish ownerId; clients must not submit it as an authority.
- Company membership must be checked before creating a campaign.
- Spot price must be read server-side.
- Client-submitted total amount must never determine the payable amount.
- Creative uploads must be validated by type, size and dimensions.
- Payment confirmation must come from a signed provider webhook.
