# Design system normalization verification — 11 September 2026

## Baseline and scope

The approved baseline is annotated tag `approved-ui-2026-09-10` at `d1eb4af`. This pass reorganized tokens, primitives, product patterns, layouts and imports. It did not change application data, permissions, routes, mutations, lifecycle meaning or the approved visual direction.

No visual difference was intentionally introduced. Named token aliases retain the approved values. The three remaining raw data tables now use the canonical Table family while retaining their route-owned classes and geometry.

## Automated checks

- `npm run typecheck`: passed.
- `npm run build`: passed; Vite transformed 2,617 modules with no chunk-size warning.
- `npm test`: 4/4 focused DataTable tests passed.
- `npm run check:production`: passed; the workbench route, module and fixtures are absent from emitted JavaScript.
- `git diff --check`: passed.
- Obsolete grouped-import scan: passed.
- Raw hex scan outside `styles/theme.css`: passed.
- Canonical-family declaration scan found one Button, Input, Textarea, Select, Checkbox, Switch, StatusBadge and DataTable owner.
- `package.json` and `package-lock.json` are unchanged from the approved checkpoint; no dependency was added.

## Browser and accessibility checks

- Admin Overview, Energy Overview, Charges & Billing, Energy Alerts and Tenant Onboarding loaded in light and dark themes using the existing simulated operational data.
- Every reviewed desktop page reported zero document and main horizontal overflow.
- The workbench renders Foundations, Components, Patterns and Layout. The Layout tab contains Analytics, Data, Operational, Setup and Detail examples built from production components.
- DataTable request sorting sets `aria-sort="ascending"`.
- Dialog opens with its accessible title and returns focus to its “Open dialog” trigger after Cancel.
- Theme switching persists across route navigation.
- The responsive route markup and breakpoint rules are unchanged from the immediately preceding page-layout verification. Existing 390×1050 captures under `artifacts/page-layout-system/` remain the mobile baseline for Energy Overview, Billing, Alerts, Visitor History, Tenant Consumption and Onboarding; the normalization introduced no route layout class change.

## Visual regression evidence

Approved before captures:

- `artifacts/page-layout-system/overview-dark.png`
- `artifacts/page-layout-system/energy-overview-dark.png` and `energy-overview-light.png`
- `artifacts/page-layout-system/billing-dark.png` and `billing-light.png`
- `artifacts/page-layout-system/alerts-dark.png` and `alerts-light.png`
- `artifacts/page-layout-system/onboarding-dark.png` and `onboarding-light.png`
- the matching `*-mobile-light.png` captures in that directory

After captures in `artifacts/design-system-normalization/`:

- `overview-dark-after.jpg`, `overview-light-after.jpg`
- `analytics-dark-after.jpg`, `analytics-light-after.jpg`
- `data-dark-after.jpg`, `data-light-after.jpg`
- `operational-dark-after.jpg`, `operational-light-after.jpg`
- `setup-dark-after.jpg`, `setup-light-after.jpg`
- `workbench-dark-after.jpg`, `workbench-light-after.jpg`, `workbench-layout-dark-after.jpg`

Side-by-side review found equivalent page edges, typography, control geometry, surfaces, divider rhythm, charts and table density. Live counts and demand values differ because the existing simulation updates over time.

## Remaining limits

The application uses its existing simulated data, so backend integration was not exercised. The complete unchanged business workflow suite was not rerun; verification focused on component architecture, imports, visual regression, themes, focus, sorting, production exclusion and overflow. No blocker or known normalization defect remains.
