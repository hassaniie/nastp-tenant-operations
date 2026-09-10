# Design system verification — 10 September 2026

## Automated checks

- `npm run typecheck`: passed.
- `npm run build`: passed (Vite production build, no chunk-size warnings).
- `npm test`: four focused tests pass: numeric/text sorting, immutable live input, obsolete/empty page clamping, selection across pages.
- `npm run check:production`: passed; emitted JavaScript contains no workbench module, route or deterministic fixtures.
- `git diff --check`: passed.

## Browser verification

Used the existing local application and its simulated operational data; no new production mock service was introduced.

- Workbench: invalid form submission associates both errors with inputs; successful valid submission; disabled/loading controls; dialog accessible title/description, cancel focus and return to opener; async confirmation failure remains open with actionable error; chart exact-value table; table sorting ARIA state, page selection, paging, keyboard detail opening, loading, empty search and retry.
- Service Requests: live records and counts, all existing status choices, search/filter/reset, keyboard row opening and focus return, responsive table. SR-5149 was acknowledged, assigned to Uzma Haider, started, commented on and resolved through the existing simulation mutations. Timeline retained each transition and resolution note. Empty resolution is disabled; valid note submits. Dirty comment close offers Keep editing / Discard; Keep editing retained text and posting succeeded. Reassignment without a reason is disabled and becomes available with a reason; category dialog explains rerouting/unassignment and rejects unchanged submission.
- Themes and responsive: reviewed desktop 1440×1000 and mobile 390×1050. No document/main horizontal overflow. Mobile request titles wrap and secondary columns remain available in details. Five-metric strip uses a full-width final summary on mobile.
- Dashboard: visually reviewed consolidated header/metrics, original analytics/ranking, attention, onboarding and live activity. Approved composition retained. Browser diagnostics showed no warnings/errors in the development review.
- Production: direct workbench URL renders “This page does not exist.” Existing Admin login remains available. A previously open preview tab initially referenced removed build chunks; loading fresh build assets resolved it (normal stale preview cache, not an application regression).

## Captures

All evidence is under `artifacts/design-system/`, separate from the approved baseline in `artifacts/redesign/`:

- `workbench-dark.png`, `workbench-light.png`, `workbench-mobile-light.png`
- `requests-dark.png`, `requests-light.png`, `requests-mobile-light.png`
- `request-detail-light.png`
- `dashboard-regression-dark.png`

## Limits and retained behavior

This is the existing simulated-data product; no real backend integration was validated. Its clock/seed can produce future relative “Updated” timestamps, which predates this presentation work. The complete unchanged route suite was not rerun. Shared controls affect their existing consumers, but remaining screens have not been migrated. Unsent request drafts survive hash navigation; only drawer dismissal and browser unload prompt, as documented in the interaction conventions. No unresolved blocker was found in the reviewed slice.
