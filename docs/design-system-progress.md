# Design system implementation checklist

Branch: main-codex-redesign. Approved checkpoint: annotated tag `approved-admin-dashboard-a5b8427` → a5b8427. Working tree was clean at start; main remains at 1055724.

## Architecture normalization pass — 10 September 2026

Approved zero-change baseline: annotated tag `approved-ui-2026-09-10` → d1eb4af. The branch and tag are pushed; `main` remains at 1055724.

- [x] Focused shared-component inventory (no route-by-route redesign audit)
- [x] Token architecture and shared geometry normalization
- [x] Primitive component-family file normalization
- [x] Product patterns and layout organization
- [x] Consumer import migration and compatibility cleanup
- [x] Workbench/documentation update
- [x] Visual regression and final verification

### Inventory decisions

| Existing source | Normalization decision |
| --- | --- |
| `styles/theme.css` | Remains the single light/dark token source. Separate semantic colors, visualization colors, primitive scales, geometry, motion, elevation, and z-index without changing values. |
| `ui/form.tsx` | Split into Input, Textarea, Select, Checkbox, Switch, Radio Group, and Field families; remove the grouped file after consumer migration. |
| `ui/overlay.tsx` | Split into Dialog, Drawer, Tooltip, Popover, and Dropdown Menu families; share focus-return behavior through the Dialog family. |
| `ui/primitives.tsx` | Split Badge, Avatar, Separator, Skeleton, Spinner, Progress, Kbd, IconBox, and semantic tone recipes. Move product StatusBadge to patterns. |
| `ui/data.tsx` | Keep DataTable as the single data-table composition; move Pagination and feedback/product states to dedicated files. |
| `common.tsx` | Split product compositions into dedicated `patterns/` files; retain a compatibility barrel until consumers migrate. |
| `status.tsx` + `lib/meta.ts` | Move badge renderers to `patterns/status-badge.tsx`; keep lifecycle labels/tones in `lib/meta.ts` as the business-state source of truth. |
| `charts.tsx` | Move the existing chart family intact to `patterns/charts.tsx`; preserve a compatibility export and the independent viz palette. |
| `ui/page.tsx` | Split structural components into `layout/`; remove the grouped file after consumer migration. |
| Workbench | Continue using real production exports; reorganize sections as Foundations, Components, Patterns, and Layout. |

Token phase complete: semantic color values are unchanged; repeated typography, control, shell, gutter, density, icon, motion, elevation, and z-index decisions now have named tokens in `theme.css`. Shared page layouts and the shell consume the geometry tokens. Typecheck and production build pass.

Primitive phase complete: form controls, overlays, feedback primitives, badges, identity, progress, and data-table support now live in predictable component-family files. `form.tsx`, `overlay.tsx`, `primitives.tsx`, and `data.tsx` are temporary compatibility barrels. Existing public behavior and classes were retained. Typecheck, focused tests, and production build pass.

Pattern/layout phase complete: metrics, stat cards, status families, charts, timelines, stepper, page/section headers, navigation tabs, feedback, confirmation, and definition lists now live in `components/patterns/`. Page, grid, toolbar, metric-band, section, split, detail, and action structures now live in `components/layout/`. Existing grouped files redirect to these owners. Typecheck, focused tests, and production build pass.

Consumer migration complete: all application and workbench imports now point to the canonical family or composition owner. The obsolete grouped files and unused compatibility exports were removed after repository-wide reference checks. Three remaining raw data tables were migrated to the canonical Table family without changing their local geometry. Raw buttons that remain are composition-specific rows, tabs, navigation, file controls, or icon affordances whose styling is intentionally owned by their pattern.

Workbench/documentation complete: the lightweight development route now presents Foundations, Components, Patterns, and all five Layout archetypes using production exports. `design-system.md` documents the final ownership, token hierarchy, APIs, states, accessibility, imports, compatibility policy, and future implementation rules.

Final verification complete: typecheck, production build, focused tests, production-boundary check, import/color/duplicate scans, light/dark browser review, focus restoration, sorting semantics and overflow checks pass. Representative before/after evidence is recorded in `design-system-verification.md`.

- [x] Checkpoint and focused inventory
- [x] Shared semantic foundations and conventions
- [x] Consolidated production primitives and states
- [x] Reusable patterns and protected development workbench
- [x] Service Requests proof workflow
- [x] Focused tests, keyboard/theme/responsive review, screenshots
- [x] Final commits and push

## Inventory decisions (read once, use this handoff)

| Existing source | Decision |
| --- | --- |
| theme.css + admin-workspace.css | Consolidate color definitions in theme.css, alias approved ops variables to semantic tokens. Keep Dashboard composition CSS, remove duplicated primitive styling. |
| primitives.tsx Button + ops-button.tsx | One canonical button.tsx based on the existing shadcn/Radix Slot implementation; primitives re-exports for compatibility. Remove ops duplicate. |
| ops-table.tsx + data.tsx | One table.tsx; DataTable composes it and owns sorting/pagination/optional controlled selection. Remove ops duplicate. |
| form.tsx | Reuse Radix Select/Checkbox/Switch. Standardize states and associated Field labels/errors; add native RadioGroup for actual choice patterns. |
| overlay.tsx | Reuse Radix dialog/drawer/popover/menu/tooltip. Standardize sizing and focus, add reusable async confirmation. |
| tabs.tsx | Reuse Radix Tabs. Consolidate segmented controls into accessible pressed-button choices; fix tab keyboard behavior. |
| primitives.tsx status/avatar/progress/loading | Standardize restrained, text-led states; retain public props and domain mappings. Remove decorative avatar gradients. |
| status.tsx + lib/meta.ts | Retain lifecycle meaning and source-of-truth maps. Dashboard consumes domain badges instead of independent mappings. |
| common.tsx + card.tsx + page.tsx | Extend existing PageHeader/SectionHeader/metrics/layouts with approved workspace variants. No second page component family. |
| charts.tsx | Retain Recharts, exact-value tables, legends and live theme bridge. Use approved palette and canonical chart frame. |
| toast.tsx + session store | Retain event/store API, refine presentation and announcements. |
| Service Requests + serviceShared.tsx | Proof migration only. Keep simulation mutations and transition rules. Improve filters, row keyboard access, form labels, validation, draft retention and confirmation. |

## Scope boundary

Shared tokens and canonical components necessarily update their existing consumers. This task does not recompose the other Admin, Tenant, Technician, or auth screens. Their layout migrations remain separate work after approval. No new dependencies or mock production services are planned.

## Resume handoff

Foundation: 39005c9. Canonical components/workbench: 77acfb9. Implementation and focused verification complete; see design-system.md for contracts and design-system-verification.md for evidence. The workflow commit completes this slice; branch and checkpoint tag are pushed. Do not restart inventory or expand migration scope.

## Page-layout system pass

- [x] Classify routes into Analytics, Data, Operational, Setup, and Detail workspaces
- [x] Add reused page-level metric, section, split, queue, and setup structures
- [x] Migrate Energy Overview and Tenant Consumption
- [x] Migrate Charges & Billing and shared Admin Visitor lists
- [x] Migrate Energy Alerts and Tenant Onboarding
- [x] Verify desktop dark/light, mobile overflow, core interactions, typecheck, tests, and build

See `page-layout-system.md` for the reusable composition rules and `page-layout-verification.md` for evidence. Remaining route migration is intentionally deferred to the next batch.
