# NASTP product design system

The approved Admin Overview is the visual source of truth. The annotated tag `approved-ui-2026-09-10` preserves the zero-intentional-change baseline at `d1eb4af`. This architecture consolidates that UI; it does not introduce another visual language or dependency.

## Architecture and ownership

The dependency direction is tokens → primitives → product patterns → layouts → screens.

| Layer | Source | Ownership |
| --- | --- | --- |
| Tokens | `src/tenant/styles/theme.css` | The only light/dark color source plus shared typography, spacing, geometry, motion, elevation and z-index values. |
| Shared styling | `src/tenant/styles/components.css` | Canonical component and layout recipes. `admin-workspace.css` retains the approved shell and Overview composition. |
| Primitives | `src/tenant/components/ui/` | Reusable controls, overlays, feedback primitives, surfaces and table families. A primitive does not know a NASTP lifecycle. |
| Product patterns | `src/tenant/components/patterns/` | NASTP metrics, headers, statuses, timelines, steps, feedback compositions and charts. |
| Layout | `src/tenant/components/layout/` | Page, metric band, workspace section/split, toolbar, detail and action structures. |
| Business meaning | `src/tenant/lib/meta.ts` | Lifecycle labels and semantic tones. Routes do not redefine status colors or labels. |
| Screens | `src/tenant/routes/` | Compose canonical pieces while retaining data, permissions, navigation and mutations. |

Grouped `common.tsx`, `status.tsx`, `charts.tsx`, `ui/form.tsx`, `ui/overlay.tsx`, `ui/primitives.tsx`, `ui/data.tsx` and `ui/page.tsx` were removed after consumers migrated. There are no permanent compatibility barrels. Add new work to the owning family file.

## Token hierarchy

- Semantic surfaces: `canvas`, `background`, `surface`, `surface-raised`, `surface-overlay`, `surface-inset`.
- Text and lines: `foreground`, `muted`, `subtle`, `disabled`, `border`, `border-subtle`, `border-strong`.
- Interaction: `primary`, `primary-hover`, `primary-active`, `primary-muted`.
- Operational meaning: `success`, `warning`, `critical`, `info`, `online`, `offline`, plus `energy`, `visitors` and `service`. Each has theme-specific values behind the same name.
- Visualization: `viz-1` through `viz-6` are categorical series; `seq-1` through `seq-7` are sequential intensity. They remain independent of status colors.
- Primitive scales: 4/8/12/16/20/24/32/40 spacing; caption/body/section/page-title typography; control/surface/overlay radii; xs/sm/md/lg control and icon sizes.
- Layout and density: topbar/sidebar dimensions, mobile/tablet/desktop gutters, section gap, compact/default table rows and list rows.
- Motion and layering: fast/standard/slow durations, standard/decelerate easing, reduced-motion override, shadow levels and named sticky/dropdown/popover/overlay/modal/toast z-index tiers.

Components consume semantic variables. Raw color values belong only in `theme.css`. A repeated number becomes a token only when it represents an actual system rule.

## Canonical primitives

- `button.tsx`: Button variants `primary`, `secondary`/default, `outline`, `ghost`, `subtle`, `danger`, `success`; deliberate sizes; disabled/loading/asChild. IconButton requires an accessible label and supports small/default size plus selected, disabled and loading states.
- `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`, `radio-group.tsx`, `field.tsx`: associated labels, hints/errors, invalid and disabled semantics, native or Radix keyboard behavior.
- `badge.tsx`, `avatar.tsx`, `separator.tsx`, `skeleton.tsx`, `spinner.tsx`, `progress.tsx`, `kbd.tsx`, `icon-box.tsx`: small presentation and feedback families with restrained APIs.
- `dialog.tsx`, `drawer.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`: Radix focus trapping, Escape handling and focus restoration using NASTP geometry and surfaces.
- `tabs.tsx` and `segmented-control.tsx`: panel navigation and pressed-choice controls remain separate semantics.
- `table.tsx`, `data-table.tsx`, `pagination.tsx`: one table family. DataTable owns sorting, paging, selection, bulk actions and explicit loading/error/empty states.
- `card.tsx` and `toast.tsx`: contained secondary surfaces and announced transient feedback. Primary workspaces do not default to cards.

Keep component APIs finite. A one-screen color or geometry adjustment belongs in its composition, not a new global variant.

## Product patterns

`patterns/` owns MetricValue/Delta, StatCard, StatusBadge and all domain badge renderers, PageHeader, SectionHeader, Breadcrumb, AdminSidebar, Timeline, Stepper, navigation tabs, filter chips, confirmation, Empty/Error/NoPermission states, definition/key-value lists and theme-aware charts. These patterns consume primitives and tokens while expressing NASTP product language.

Status labels, tones and icons come from `lib/meta.ts`. Status is never communicated by color alone. Charts use the visualization palette and always expose units, periods, legends where needed and exact values through ChartFrame.

## Page archetypes

The detailed composition contract is in `docs/page-layout-system.md`.

- Analytics: MetricBand plus integrated full-width or split WorkspaceSections.
- Data Workspace: PageHeader, ListToolbar, DataTable and integrated pagination on one data surface.
- Operational Workspace: optional status strip, integrated filters and flat separated triage rows.
- Setup Workspace: progress, structured content/context columns and predictable WorkspaceActions.
- Detail Workspace: entity header, status/metadata, tabs or structured DetailSections and contextual actions.

Page, WorkspaceSection, WorkspaceSplit, MetricBand, ListToolbar, DetailSection, FormActions and WorkspaceActions own shared spatial decisions. Primary sections use aligned edges and dividers; radius is reserved for controls, overlays and purposeful secondary panels.

## State and accessibility conventions

- Hover, active, selected, disabled, loading, invalid, readonly, empty, error and success states use shared tokens and visible text where meaning matters.
- Use visible `focus-visible` treatment. Icon-only actions require an accessible label. Controls preserve keyboard operation and correct `aria-invalid`, `aria-selected`, `aria-pressed`, `aria-sort`, `role=status` or `role=alert` semantics.
- Field owns label, description and error associations. Async submission disables repeat action, retains entered values and exposes failure near the action.
- Dialogs trap focus and restore it to their opener. Destructive confirmation names the object/action, gives Cancel initial focus, and remains open while pending or failed.
- Tables own horizontal overflow; lower-priority columns may hide only when complete information remains available in details. Rows open with Enter/Space without intercepting embedded controls.
- Empty states explain the absence and offer a real permitted next action. Loading retains context; retry does not discard inputs.
- Reduced-motion removes animation and numeric tweening while retaining state visibility.

Use pages for navigable workspaces, drawers for contextual detail, dialogs for focused decisions/edits and popovers for short pickers. Primary page actions sit at the header edge; save is last/right in form actions.

AdminSidebar consumes the single route tree in `app/nav.ts`. The rail and each labelled group have independent collapsed/expanded state; active modules and active leaf pages use separate visual states and ARIA. Breadcrumb renders linked ancestors and a non-interactive `aria-current="page"` leaf. Topbar breadcrumbs derive from the same route match, so navigation labels and destinations cannot drift.

## Imports and compatibility

Import directly from the owner:

```tsx
import { Button } from '@/tenant/components/ui/button'
import { Input } from '@/tenant/components/ui/input'
import { StatusBadge } from '@/tenant/components/patterns/status-badge'
import { WorkspaceSection } from '@/tenant/components/layout/workspace-section'
```

Compatibility re-exports may be introduced briefly during a staged migration, must be documented, and must be removed when the final consumer moves. Circular imports and giant unrelated barrels are prohibited. There are currently no retained compatibility exports or deprecated duplicate component families.

## Development workbench

```sh
npm ci
npm run dev -- --host 0.0.0.0 --port 5188
```

Sign in with the existing Admin demo account and open `http://localhost:5188/#/admin/design-system`. Foundations, Components, Patterns and Layout render the actual production components with deterministic local fixtures. The route and fixtures are excluded from production builds.

## Rules for future implementation

1. Check for an existing canonical component before creating anything.
2. Never create route-local colors for shared statuses.
3. Never introduce a second Button, Table or Input family.
4. Reuse layout archetypes before inventing page spacing.
5. Prefer semantic tokens over hard-coded visual values.
6. Keep product patterns separate from primitives.
7. Preserve light/dark parity.
8. Add genuinely reusable new components to the workbench.
9. Do not change business-state semantics in UI code.
10. Do not introduce a new design language without explicit approval.
