# NASTP Tenant Operations

An interconnected tenant operations ecosystem: a **NASTP Admin** control plane
for park operators and a **Tenant Portal** for each tenant organisation. The
tenant is the central operational identity — every meter reading, visitor and
service request resolves back to one.

## Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS v4 · React Router 7 (HashRouter)
· Radix UI primitives · Recharts · lucide-react

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then bundle to dist/
npm run typecheck
```

## The three domains

| Domain | What it covers |
| --- | --- |
| **Energy** | Floor main meters vs tenant sub-meters, globally configured tariffs with effective periods, data-driven peak/off-peak windows, consumption, billing and alerts |
| **Visitors** | Scheduling, recurring visits, reception verification (no QR or digital pass — reception verifies), overstay detection, history |
| **Service Center** | 13 request categories with a full lifecycle: acknowledge → assign → in progress → resolve → tenant confirms and rates |

A tariff change never recomputes a past bill: historical consumption stays
bound to the rate that applied during its period.

## Architecture

```
src/tenant/
├── main.tsx        entry point
├── app/            Shell, navigation, command palette, notifications
├── components/     ui primitives, charts, common, status
├── data/           types, world generator, selectors, live simulation, api
├── hooks/          useAsync — loading, error and retry
├── lib/            utils, metadata maps, seeded RNG
├── routes/         admin/ and portal/ screens plus shared workflows
├── store/          session state
└── styles/         theme.css — design tokens, light and dark
```

The API layer (`data/api.ts`) exposes `adminApi` and a per-tenant `tenantApi`
with latency and fault injection, so swapping the simulation for real HTTP
calls only touches method bodies. Tenant ID is the isolation boundary —
portal screens never see another tenant's data.

Full documentation lives in [`docs/`](docs/): architecture, information
architecture, data model, business rules, design system, one guide per domain,
states and edge cases, the API contract, and the roadmap.

## Provenance

Extracted from `hassaniie/Claude-Code`, branch
`claude/github-repo-attachment-50g66z`. The full development history remains in
that repository.
