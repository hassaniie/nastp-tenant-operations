# NASTP page layout system

The approved Admin Overview is the structural reference. These archetypes compose the existing design-system controls; they do not introduce another component library, shell, theme, or status language.

## Archetypes and route mapping

| Archetype | First implemented routes | Next routes that use the same pattern |
| --- | --- | --- |
| Analytics | Admin Energy Overview; Tenant Consumption | Visitor Overview; Service Performance; tenant energy dashboards |
| Data Workspace | Charges & Billing; Visitor History; the shared Admin Visitor lists | Tenants; Meters; Scheduled Visitors; Users; Reports; tariff tables |
| Operational Workspace | Energy Alerts; live Admin Visitor lists; Service Requests | Meter issues; live visitor reception; technician jobs |
| Form / Setup Workspace | Tenant Onboarding | settings and configuration flows; visitor scheduling; recurring visits |
| Detail Workspace | Existing Service Request drawer establishes the interaction; entity pages are intentionally deferred | Tenant, meter, building, invoice and visitor details |

The shared Admin Visitor list chooses Data Workspace for history and Operational Workspace for live states. This keeps one implementation while giving each workflow the correct structural intent.

## Canonical layout primitives

- `Page workspace archetype="…"` removes the legacy centred card-page gutters and records the page’s structural role.
- `PageHeader` owns a 32px desktop / 20px mobile gutter and the title/action hierarchy.
- `MetricBand` renders `StatCard variant="inline"` as cells on common grid lines. It supports two through six columns and collapses to two columns on mobile.
- `WorkspaceSection` gives analytical and detail content a shared heading, inset, and bottom divider. `inset={false}` lets a table meet the workspace edge while retaining an integrated section heading.
- `WorkspaceSplit` uses balanced, wide, or equal ratios, a shared central divider, and a single-column tablet/mobile fallback.
- `ListToolbar` sits immediately above `DataTable`; both share the workspace edges. Filters wrap at their content needs, reset together, and reset pagination.
- `ds-operational-toolbar`, `ds-flat-list`, and `ds-operational-row` form a dense triage queue with separators and stable actions instead of nested alert cards.
- `ds-setup-progress`, `ds-setup-grid`, and `WorkspaceActions` create a continuous form workspace with progress, primary content, persistent context, and one predictable action area.

## Spatial rules

Primary page regions have no outer radius or shadow. Borders connect adjacent metric, chart, toolbar, table, and list regions. Radius remains on controls, overlays, and small contained widgets where the boundary carries meaning. Top-level sections use 28–32px desktop insets and 20–22px mobile insets. Analytical splits collapse below 1024px. Tables hide declared secondary columns while preserving the full record in a drawer/detail view, and the document must never gain horizontal overflow.

Routes keep their existing data selectors, permissions, URL destinations, dialogs, drawers, mutations, validation, and status metadata. Layout migration changes composition and interaction hierarchy only.
