# Design System

The single source of truth is
[`src/tenant/styles/theme.css`](../../src/tenant/styles/theme.css). Every
semantic token is defined twice — dark is the platform default so the suite
feels like one product; **light is a full peer, engineered not inverted** for
the office daylight context most tenants live in.

## Tokens (§39)

Semantic, never hardcoded in components. Names follow shadcn semantics so the
primitive layer stays portable.

- **Surfaces** — `canvas`, `background`, `surface`, `surface-raised`,
  `surface-overlay`, `surface-inset`, `surface-subtle`.
- **Type** — `foreground`, `muted`, `subtle`, `disabled`.
- **Lines** — `border`, `border-strong`, `border-subtle`.
- **Brand** — `primary` (indigo — the tenant identity), `primary-hover`,
  `primary-active`, `primary-muted`.
- **Status** — `success`, `warning`, `critical`, `info`, `neutral` (each with a
  `-dim` companion). Reserved for state; never used as a chart series.
- **Connectivity** — `online`, `offline`.
- **Module identities** — `energy` (amber), `visitor` (teal), `service`
  (violet), so the three tenant domains are legible at a glance.
- **Data-viz** — `--viz-1..6` (validated categorical ramp) and `--seq-1..7`
  (sequential). Assign slots in order; never cycle past slot 6; never borrow a
  status or module hue for a series.

## Status colour system (§40)

Status is **never colour alone**. Every badge pairs a tone with a text label
and, for categories, an icon. The `Tone → label + tone` mapping lives in
[`src/tenant/lib/meta.ts`](../../src/tenant/lib/meta.ts) so a lifecycle state
reads identically on the dashboard and in the detail workspace.

## Typography

Inter for text, JetBrains Mono for data. Tabular numerals (`.tnum`) wherever a
figure can change under the reader's eye. Large values are easy to scan; units
stay visually secondary but clearly attached (`MetricValue`).

**The type scale is eight deliberate steps**, with an 11px floor — nothing
carrying information renders below it:

| Size | Role |
| --- | --- |
| 11px | eyebrow labels, table headers, timestamps, true metadata |
| 12px | secondary body, captions, supporting detail |
| 13px | body — the default for readable content and table cells |
| 14px | card and section titles |
| 15–16px | entity titles, dialog titles |
| 18–24px | page titles, entity headers |
| 30–40px | hero metric values |

Half-steps (10.5 / 11.5 / 12.5 / 13.5) were consolidated away; they made the
same role render at different sizes on different screens.

## Spacing & layout

One scale, encoded in the layout primitives rather than repeated per screen:

| Token | Value | Role |
| --- | --- | --- |
| `gap-3` | 12px | component spacing — KPI tiles, dense card rows |
| `gap-4` | 16px | comfortable — content cards side by side |
| `gap-5` | 20px | section spacing — between top-level page sections |
| `p-4` / `lg:p-6` | 16 / 24px | the page gutter |

`Page`, `StatGrid`, `ContentGrid` and `SplitGrid` in
[`components/ui/page.tsx`](../../src/tenant/components/ui/page.tsx) apply these,
so no screen defines its own page padding, section rhythm or grid ratio.
`SplitGrid` in particular replaces what had become eleven one-off
"primary + aside" ratios with three named intents (`balanced`, `wide`,
`aside`). Its `fr` tracks are all `minmax(0,·)`: a bare `1fr` floors at its
content's min-content width, so a single wide table used to push its column
past its share and scroll the page sideways.

### Filling a row, and when not to

Stretching cards to a shared height is right for peers of the same kind and
wrong for panels whose content genuinely differs — the difference is stranded
inside the shorter card as space that reads as a bug. So `ContentGrid` takes
`align`: `stretch` (default) for equal-weight peers, `start` where lengths
legitimately vary, such as a building with two floors beside one with five.

Two related rules fall out of the same principle:

- An **unbounded queue never sizes a row**. The dashboard's action centre is
  taken out of flow in the two-column layout, so the energy column sizes the
  row and the queue scrolls inside it. In flow it grew to 1230px and stranded
  ~480px beside the charts.
- A **grid card body pins its rows** (`content-start`). Left to distribute, a
  card's surplus height inflates its internal tiles — on Tariffs that added
  ~100px to every rate tile.

The tenant module uses softer radii and more generous spacing than the PMS
command centre — information-rich but calm.

## Component library (§43)

- **Primitives** (`components/ui/`) — Button, Badge, StatusBadge, IconBox, Kbd,
  Skeleton, ProgressBar, Avatar/TenantMark, Separator; Card family; Input /
  Textarea / Search / Select / Switch / Checkbox / Field / SettingRow; Tabs /
  TabBar / Segmented / FilterChips; Dialog / Drawer / Tooltip / Popover / Menu;
  DataTable + EmptyState / ErrorState / LoadingState / AsyncBoundary / DefList;
  Toaster; Page / StatGrid / Toolbar.
- **Common** (`components/common.tsx`) — StatCard, MetricValue, Delta,
  AnimatedNumber, Timeline, Stepper, RatingStars, PageHeader, Breadcrumb,
  KeyValue.
- **Charts** (`components/charts.tsx`) — TrendChart, MultiLineChart,
  BarSeriesChart, DonutChart, Sparkline, all theme-aware with a table fallback.

## Charts

One measure per axis; a recessive grid; a legend whenever two or more series
are on screen; a table view for the cases where colour alone would carry
meaning. Stocks (a load held at a moment) and flows (consumption per period) are
drawn as separate charts rather than sharing a y-scale.

## Motion

Subtle and purposeful — page/drawer transitions, toast slide-ins, status
pulses, chart fades. `prefers-reduced-motion` collapses all of it.

## Accessibility (§50)

Keyboard navigation and visible focus rings; status paired with label/icon;
charts ship readable supporting values (table toggle); forms have clear
validation and error messages; the light palette flags the three low-contrast
viz slots so light-mode charts always ship a legend.
