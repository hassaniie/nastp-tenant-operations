# Migrating this app to ReUI (free tier)

Everything here works on ReUI's **free** tier. No Pro/Ultimate licence is
needed, and none is configured.

## What free actually covers

| Type | Free? | What it is |
|---|---|---|
| **Components** (22) | ✅ | The real building blocks with APIs: `data-grid`, `kanban`, `stepper`, `timeline`, `filters`, `gantt`, `event-calendar`, `tree`, `cascader`, `autocomplete`… |
| **Examples** (`c-*`) | ✅ | Hundreds of worked compositions — `c-data-grid-34`, `c-filters-7`, `c-kanban-1`. Install one and read it to copy the exact composition. |
| **shadcn primitives** | ✅ | `button`, `card`, `dialog`, `sheet`, `select`, `input`, `avatar`, `badge`, `table`… pulled in automatically as registry dependencies. |
| **Blocks** (57 categories) | ❌ Pro | Pre-composed *full page sections* — `app-shell`, `dashboard`, `kanban-board`, analytics. |
| **Motion Icons** | ❌ Ultimate | Animated icon set. |

The practical difference is **only** that we compose each page ourselves out of
free components instead of dropping in a ready-made section. That is the same
work either way — a premium block still has to be wired to real data.

The one thing with no free equivalent is the outer **app shell** (sidebar +
topbar). That stays as `app/Shell.tsx` is today, restyled rather than replaced.

## Step 1 — Done already (committed on `feat/reui-admin-rebuild`)

- `components.json` — registry wired to `@reui`, `style: radix-nova` (this
  project is Radix-based throughout), no licence headers.
- `@` alias now resolves to `src/tenant`, in both `vite.config.ts` and a new
  `tsconfig.json` `paths` entry, so ReUI's own `@/components/ui/...` and
  `@/lib/utils` imports land on the folders this app already uses.
- **Theme conformed to shadcn token semantics** — see the commit message for
  the full reasoning. Short version: added the missing `card`, `popover`,
  `accent`, `destructive`, `input` and `chart-1..5` tokens (each mapped onto
  an existing surface/status hue), and resolved the one real collision where
  `muted` meant dimmed *text* here but a subdued *surface* in shadcn. 103
  `text-muted` sites became `text-muted-foreground`, rendering the identical
  colour. Verified: 80/80 route/theme QA sweep clean.
- `@tanstack/react-table` installed (`data-grid` requires it).

## Step 2 — Run this on your machine

`reui.io` is blocked by the network policy on the cloud session, so the
registry fetch has to happen somewhere with normal internet access.

```bash
git fetch origin
git checkout feat/reui-admin-rebuild
npm install

npx shadcn@latest add @reui/data-grid @reui/kanban @reui/stepper @reui/timeline @reui/filters --yes
```

**If that 404s**, the style slug is the only likely cause. Open
`components.json` and try `"style": "radix"` instead of `"radix-nova"`, then
re-run. (Everything else in the config is confirmed correct.)

Then sanity-check and push:

```bash
npx tsc --noEmit && npm run build
git add -A && git commit -m "Install free ReUI components" && git push
```

## Step 3 — Hand it back

Tell me it's pushed and I take over the actual migration: swapping each page
onto the installed components, wiring the existing live data through them, and
re-running the Playwright suites after each group. Order is in the plan —
data-grid pilot on Tenants first, then the rest of the tables, charts, drawers,
forms, stepper, kanban, timelines, shell.

## Optional: make the MCP match this project

Two headers on the ReUI MCP server config stop it showing things that don't
apply here:

- `X-Reui-Free-Only: true` — hides premium blocks from search entirely, so
  nothing surfaces that can't be installed.
- `X-Reui-Style: radix-nova` — points doc and preview links at the Radix
  variant rather than the default Base one.
