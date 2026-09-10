# NASTP product design system

The approved Admin Dashboard is the visual source of truth. The checkpoint tag `approved-admin-dashboard-a5b8427` preserves that implementation. This system consolidates it; it does not introduce a new template or dependencies.

## Structure and ownership

- `src/tenant/styles/theme.css`: semantic light/dark tokens, Tailwind bridge, focus and reduced-motion defaults. Approved `ops-*` names are compatibility aliases, not another palette.
- `src/tenant/styles/components.css`: shared headers, metric strips, table/filter workspaces, detail sections and form actions.
- `src/tenant/styles/admin-workspace.css`: approved shell and Dashboard composition.
- `src/tenant/components/ui/`: canonical controls, surfaces and data patterns. `common.tsx`, `charts.tsx`, `status.tsx` remain the shared product compositions.
- `src/tenant/lib/meta.ts`: existing status meanings, labels and tones. Do not independently map lifecycle statuses in routes.
- `src/tenant/dev/DesignWorkbench.tsx`: real components with local deterministic fixtures, dynamically imported only in development, inside the existing Admin permission boundary.

## Foundations

| Role | Convention |
| --- | --- |
| Canvas and surfaces | `canvas`/`surface` are the integrated workspace; `background`/`surface-inset` separate navigation and table headers; `surface-raised` is hover/selected context; `surface-overlay` is a dialog or menu. |
| Borders/elevation | `border` separates sections, `border-subtle` for secondary divisions, `border-strong` for stronger control boundaries. Avoid repeated floating cards. Reserve medium/large shadows for overlays. |
| Text | Foreground for values/headings, muted for body metadata, subtle for supporting labels; disabled only for unavailable controls. Body 14px, captions 12px, section 14–16px, page title 30px (25px mobile). Tabular numerals for operational values. |
| Spacing | 4, 8, 12, 16, 20, 24, 32, 40px. Workspace gutter 32px desktop, 20px mobile. Standard control gap 8px; filter gap 12px. |
| Dimensions | Controls 32/36/44px; dense extra-small actions 27px. Radii: control 6px, surface 8px, overlay 10px. Use large controls for primary touch-heavy forms. |
| Brand | Sage primary: dark #a3c9b3, light #376b53. Main action may use the approved neutral foreground/surface contrast. No decorative color tiles or gradients. |
| Status | Semantic success/warning/critical/info tokens have theme-specific foregrounds and subdued backgrounds. Every status includes a text label; never encode meaning only in color. Energy/visitor/service colors retain domain meaning. |
| States | Hover uses raised surface or variant hover token; active uses inset/active token; selected uses primary-muted and explicit pressed/selected ARIA; invalid uses critical border plus associated text; loading disables repeat action and announces busy; disabled dims and blocks activation. |
| Focus/icons | Visible 2px focus outline with offset. Icons normally 16px in controls, 14px for compact context. Icon-only actions require a label and usually a tooltip. Icons supplement text. |
| Motion | Short 150–180ms feedback; existing overlay entrances remain brief. Reduced-motion disables animation/transition and numeric tweening. No pulsing status decoration. |
| Responsive density | Standard Tailwind boundaries 640/768/1024/1280px; approved shell collapses on smaller viewports. Metric strips become two columns below 768px. Filters wrap; search occupies the full mobile row. Lower-priority columns hide by declared breakpoint, with all information available in details. Tables own overflow; the page must not scroll sideways. |
| Charts | Theme-derived six-series muted categorical palette; sage first. Label units and period. Recharts tooltip, legend for multiple series, and exact-value table toggle in ChartFrame. Keep semantic warning/reference lines distinct from series colors. |

## Canonical components and contracts

| Source | Public contract / intended use |
| --- | --- |
| `ui/button.tsx` | Button with primary, secondary (default), outline, ghost, subtle, danger, success; xs/sm/md/lg/icon/icon-sm sizes; loading, disabled, asChild. IconButton requires label. Native type defaults to button; forms explicitly use submit. `primitives.tsx` re-exports for existing imports. Old ops-button removed. |
| `ui/form.tsx` | Input/Textarea forward native props/ref. Field owns label, required indicator, hint/error associations; controls consume its context. SearchInput has labelled clearable search. SimpleSelect/Radix Select, Checkbox (including indeterminate), Switch, and native RadioGroup preserve keyboard semantics. |
| `ui/primitives.tsx` | Badge for short metadata; StatusBadge for text-led semantic state; neutral Avatar; domain TenantMark; Skeleton, labelled Spinner, clamped ProgressBar, Separator. Existing APIs retained. |
| `ui/overlay.tsx` | Radix Dialog/Drawer with title/description/body/footer, Tooltip, Popover and Menu. ConfirmDialog accepts async onConfirm; pending blocks dismissal; rejection stays open with an alert; cancel receives initial focus. Programmatic overlays restore their opening control's focus. |
| `ui/tabs.tsx` | Radix Tabs for actual panels; keyboard TabBar for existing callers; Segmented is an aria-pressed choice group, with actual disabled options. |
| `ui/table.tsx`, `ui/data.tsx` | One shadcn Table, composed by DataTable. Columns define cell/sortValue/hideBelow. rowKey required; rowLabel names keyboard-openable rows. resetKey resets paging after filter changes. Controlled selection/onSelectionChange plus optional bulkActions; page selection preserves other pages. loading/error/onRetry/emptyAction are explicit states. Pagination clamps after data shrinks. Old ops-table removed. |
| `common.tsx`, `ui/card.tsx`, `ui/page.tsx` | PageHeader, SectionHeader, StatCard inline/surface, MetricValue, Page workspace, ListToolbar, DetailSection, FormActions, DefList. Inline metrics consume the same typography as Dashboard. |
| `charts.tsx`, `status.tsx`, `ui/toast.tsx` | ChartFrame and existing charts, exact-value tables use canonical Table; domain badges use existing maps; toast store/API retained with success/error announcements. EmptyState, ErrorState, NoPermissionState expose actual actions only. |

Use existing compatibility exports when maintaining older screens. New screens import canonical files. Do not add alternative Button/Table families or route-local status colors. Stable business selectors and mutations stay in existing data/hooks.

## Interaction conventions

- Use pages for navigable workspaces, drawers for contextual details, dialogs for focused edits/decisions, popovers for short pickers. Preserve URL-backed detail selection and list context.
- Page actions belong top-right; main form action is last/right in the footer, cancel immediately before it. One clear primary intent per action area.
- Associate labels, hints and validation errors with controls. Retain entered values on failure. Explain required reasons beside the input; disable only when prerequisites are clear. Async errors stay visible and offer retry.
- Confirm destructive actions with explicit object/action language. Cancel gets initial focus. Keep the overlay open while pending and on failure; prevent duplicate submission.
- Unsent request comments are scoped by identity, experience and request, retained in session storage. Closing a dirty drawer asks to keep editing or discard; posting clears the draft. Browser unload warns. Hash-route navigation retains the draft rather than globally blocking navigation. Temporary assignment/category edits retain established cancel behavior.
- Sort from header buttons, announce aria-sort, reset the page after sorting/filter changes, retain sorting during live refresh. Selection is controlled; bulk actions must correspond to real authorized operations. The production Requests page adds no speculative bulk mutation.
- Rows open with Enter/Space, without hijacking embedded controls. Radix provides focus trapping, Escape and keyboard picker behavior; focus returns to connected opening controls. If a filtered row disappears after a transition it cannot receive focus; navigate from the remaining workspace controls.
- Empty states explain the absence and give a real next step. Loading preserves context; errors expose retry without clearing user inputs. No-permission states describe the actual access boundary, never offer fake escalation.
- Wrap long operational titles and keep the full value in the detail workspace. Do not truncate the only available copy of important data.

## Representative workflow

Admin Service Requests now consumes the shared workspace, metrics, labelled filters, canonical table/statuses and contextual drawer. Search also matches tenant names; all existing lifecycle statuses are available; critical/overdue metrics apply real filters. Existing routes, permissions, simulation data, live subscriptions, attachments, comments, assignment, category routing and transitions remain.

Admin resolution now uses the existing note-required resolution dialog, matching the Technician convention. No status meanings were changed. Shared drawer/control improvements also reach their existing Tenant/Technician consumers; those screens were not recomposed.

## Local workbench

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 5188
```

Open `http://localhost:5188/#/admin/design-system`. If signed out, use the existing Admin demo account picker (`a.raza@nastp.pk`, password `nastp2026`), sign in, then open the URL. Foundations, Components, Patterns and NASTP domain tabs use real components. Header theme control switches light/dark. Fixtures stay in local workbench state. No production route or fixture chunk is emitted.

## Migration order after approval

1. Remaining Service Center Board/Performance and Technician request lists (reuse validated detail workflow).
2. Admin tenant directory/details and onboarding forms.
3. Visitor lists, approvals and visit details.
4. Energy meters/analytics and alert workspaces.
5. Tenant workspace pages, then settings, authentication and recovery forms.

Preserve each screen's selectors and permission guards; replace only presentation and inconsistent interaction patterns. Validate one workflow at a time.
