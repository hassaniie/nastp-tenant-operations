# Design system implementation checklist

Branch: main-codex-redesign. Approved checkpoint: annotated tag `approved-admin-dashboard-a5b8427` → a5b8427. Working tree was clean at start; main remains at 1055724.

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
