# Cross-experience design-system verification

Verified 11 September 2026 on `main-codex-redesign`.

## Architecture result

- Admin, Tenant and Technician compose `AppShellFrame`, `AppShellColumn`, `AppTopbar` and `AppMain`.
- Admin retains its deep `AdminSidebar`; Tenant uses the shallow `WorkspaceSidebar`; Technician uses the task-focused topbar. These navigation differences are intentional.
- Tenant Home/Energy use Analytics Workspace, lists use Data Workspace, forms use Setup Workspace and Organization uses Detail Workspace.
- Technician Jobs uses Operational Workspace and the shared service-request drawer.
- Login, Reset Password and Accept Invite use `AuthWorkspace` and `AuthPanel`.
- All experiences consume the same theme tokens, canonical controls, overlays, tables, status mappings, feedback states and page patterns. There are no compatibility barrels or duplicate primitive families.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run build` | Pass |
| `npm test` | Pass, 4/4 |
| `npm run check:production` | Pass; workbench route/module/fixtures absent from emitted JavaScript |
| Legacy grouped imports | None |
| Raw route colors in Tenant/Technician/Auth | None |
| Legacy Card/Page composition in migrated experiences | None |

## Browser review

Desktop dark and light were reviewed for Admin Overview/Billing, Tenant Home/Energy/Service/Visitors, Technician Jobs/job drawer, and Auth Login/Reset/Invite. Keyboard-visible row actions, tab navigation semantics, theme switching, drawer focus trapping/restoration, form labels and disabled states were checked. Shared responsive rules stack metric bands and workspace splits, reduce gutters, move sticky action bars into flow, preserve table horizontal scrolling and collapse shell navigation; the existing canonical mobile evidence remains under `artifacts/design-system/` and `artifacts/page-layout-system/`.

New representative evidence is in `artifacts/cross-experience/`:

- `admin-overview-dark.jpg`, `admin-billing-dark.jpg`
- `tenant-home-dark.jpg`, `tenant-energy-dark.jpg`, `tenant-energy-light.jpg`, `tenant-service-dark.jpg`, `tenant-visitors-dark.jpg`
- `technician-jobs-dark.jpg`, `technician-job-workflow-dark.jpg`
- `auth-login-dark.jpg`, `auth-reset-dark.jpg`, `auth-invite-dark.jpg`
- `workbench-layout-dark.jpg`

No intentional palette, type-scale or component-geometry redesign was introduced. The intentional visual change is compositional: Tenant, Technician and shared Notifications primary content now uses integrated workspace sections, metric cells and divider-led rows instead of floating primary cards.
