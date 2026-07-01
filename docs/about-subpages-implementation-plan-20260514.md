# About Subpages Implementation Plan 2026-05-14

## Goal

Implement the mockup direction from `public/assets/mockups/about-subpages-reference.png` as React + Tailwind DOM pages while preserving the current JUON visual system.

The `#/about` route becomes a hub page. The detailed content moves into:

- `#/about/sdgs`
- `#/about/staff`
- `#/about/organization`

Staff introduction must not use staff photos or portrait imagery. Use text-first cards only.

## Visual Thesis

Calm Japanese NPO site with forest photography, linen surfaces, restrained gold CTA accents, and small SDGs color chips only where they clarify meaning. The pages should feel like a faithful DOM reconstruction of the generated mockup, not a new art direction.

## Content Plan

1. `#/about`
   - Standard forest banner.
   - Short mission statement.
   - Four hub cards: SDGs, staff, organization, activities.
   - Bottom CTA to participation/support.
2. `#/about/sdgs`
   - Forest banner.
   - Goal cards for SDGs 8, 11, 12, 15.
   - Forest cycle illustration using `public/assets/generated/sdgs-forest-cycle.png`.
   - Activity-to-SDG table.
3. `#/about/staff`
   - Forest banner.
   - Filter-like category tabs as static visual controls.
   - Text-only staff cards grouped by category.
   - Source/date note.
4. `#/about/organization`
   - Formal warm banner.
   - Basic information table.
   - Timeline.
   - Public document link cards.
   - Contact CTA.

## Interaction Thesis

- Page sections enter with a restrained upward fade.
- Hub cards and staff cards use small hover lift / border color changes.
- SDGs goal cards use gentle hover emphasis, but no loud bounce or decorative motion.
- Respect `prefers-reduced-motion`.

## Implementation TODO

- [ ] Add routes for `#/about/sdgs`, `#/about/staff`, and `#/about/organization`.
- [ ] Keep the header item `JUONとは` active for all `/about` child routes.
- [ ] Update `siteRoutes`, route ids, and metadata for the new pages.
- [ ] Refactor `AboutPage` into a hub page.
- [ ] Move staff rendering to `AboutStaffPage` and remove all staff images/placeholders.
- [ ] Add `AboutSdgsPage` with 4 SDGs cards, cycle image, and activity-to-SDG table.
- [ ] Add `AboutOrganizationPage` with organization data, timeline, and public document links.
- [ ] Add reusable small components only when they reduce duplication.
- [ ] Update `DESIGN.md` and implementation docs to mark these about routes as DOM pages.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev -- --host 127.0.0.1`.
- [ ] Verify with Browser Use:
  - desktop `1440x900`: `#/about`, `#/about/sdgs`, `#/about/staff`, `#/about/organization`
  - mobile `390x844`: same routes
  - no horizontal overflow
  - document title updates
  - header active state is correct
  - staff page has no staff photos
- [ ] Run `ui-design-safety-ja` review and fix blocking issues.

## Worker Split

- Worker 1: code implementation in `src/types.ts`, `src/data/siteContent.ts`, `src/App.tsx`, and style hooks in `src/index.css`.
- Worker 2: documentation update in `DESIGN.md`, `docs/implementation-plan.md`, and `docs/qa-checklist.md`.

Workers must not revert unrelated existing changes, and must use Browser Use for rendered checks when they are responsible for verification.
