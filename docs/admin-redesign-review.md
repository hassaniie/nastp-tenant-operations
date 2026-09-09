# Admin shell and Dashboard visual slice

Branch: `main-codex-redesign`, based on clean `main` at `1055724`.

## Review locally

```sh
npm ci
npm run dev -- --port 5188
```

Open http://localhost:5188/#/admin. Select the seeded NASTP Administrator account and sign in. The login page provides the demo credentials. For production output, run `npm run build` followed by `npm run preview -- --port 5189` and open http://localhost:5189/#/admin.

This build continues to use the product's existing live simulation and API layer. No new mock data, services, authentication paths, or data sources were introduced.

## Presentation

The public visual reference is https://shadcnblocks-admin.vercel.app/ecommerce/dashboard-9. This is an original implementation inspired by its continuous workspace, restrained surfaces, and numeric hierarchy. No paid template source was obtained or used.

- Compact grouped Admin navigation retains every destination from `ADMIN_NAV`, current-route matching, badges, search, notifications, account controls, and experience switching.
- Continuous metrics and energy panels replace the separate floating KPI and chart cards.
- Consumption, charges, tenant rankings, connectivity, arrivals, overstay counts, recent onboarding, and activity retain the existing live selectors.
- The unchanged attention builder preserves the original urgency ordering and twelve-item limit. All twelve remain accessible via View all items. Added filters separate critical/offline items from other alerts.
- The energy chart includes a demand view and an exact-value table. Rankings show exact consumption values.
- Styles are scoped to the Admin shell and Dashboard. Other Admin page bodies, Tenant pages, Technician pages, shared business logic, and workflows have not been migrated.

The new button and table components are adapted from the public shadcn/ui new-york registry: https://ui.shadcn.com/r/styles/new-york/button.json and https://ui.shadcn.com/r/styles/new-york/table.json. The upstream MIT license is included in `shadcn-ui-license.md`. Existing Radix tabs, dialogs, and application controls are reused.

## Verification

- `npm ci` restored this branch's locked React 18 dependencies; the pre-existing local node_modules contained mismatched React 19 types.
- `npm run typecheck` and `npm run build` passed.
- Production preview: successful demo sign-in, Dashboard renders, no browser errors or warnings observed.
- Live current-load values changed across observations without a reload.
- Energy consumption/demand control and exact-value table verified; table contains all 30 daily readings.
- Attention filters verified; expanded attention table contains all 12 original entries. Service attention opens the existing request detail drawer with assignment, comments, attachments, and workflow actions.
- Add tenant opens the existing validated onboarding form. Meter, visitor, and tenant links open the expected screens. Global search opens the command palette.
- Desktop dark/light and 390px mobile dark/light visually reviewed. No document horizontal overflow at 390px. Onboarding table remains horizontally scrollable on small screens.
- Mobile navigation exposes every group, supports Escape, and restores focus to the trigger. Account and search controls remain available on mobile.

The simulation can produce future relative timestamps and advances service/visitor state as before; that data behavior was not changed by this presentation slice. No operational records were manually created or modified during verification.

## Screenshots

Screenshots are in `artifacts/redesign/`: desktop dark/light, desktop detail dark/light, and mobile dark/light. The desktop detail captures include the attention, onboarding, and activity sections. Screenshots were captured from the production preview.
