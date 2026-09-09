/**
 * The Admin Dashboard KPI band: four primary tiles over one dense strip.
 *
 * The problem this solves. The dashboard previously stacked two identical
 * four-up StatCard rows, so eight figures arrived at the same visual weight
 * and "Current Load" read exactly as loudly as "Offline Meters". Nothing told
 * an operator where to look first.
 *
 * The fix is hierarchy, not decoration: the four figures that describe the
 * park right now stay as tiles, and the four supporting totals collapse into
 * a single divided strip. One container replaces four, the row costs about a
 * third of the vertical space, and the primary row gets to be primary.
 *
 * Scoped to the dashboard on purpose. `StatCard` (21 files) and `StatGrid`
 * (20 files) are untouched — every other screen keeps the presentation it
 * has today.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconBox, TONE_DOT } from '../ui/primitives';
import { Sparkline } from '../charts';
import { cn } from '../../lib/utils';
import type { Tone } from '../../lib/meta';

const INTERACTIVE_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset';

/* ------------------------------------------------------------------ primary */

export interface KpiTileProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon: LucideIcon;
  tone?: Tone;
  caption?: ReactNode;
  spark?: number[];
  sparkColor?: string;
  onClick?: () => void;
}

export function KpiTile({ label, value, unit, icon: Icon, tone = 'neutral', caption, spark, sparkColor, onClick }: KpiTileProps) {
  const hasSpark = Boolean(spark && spark.length > 1);
  const interactive = Boolean(onClick);

  const content = (
    <>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-2.5 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase leading-none tracking-[0.11em] text-subtle">{label}</p>
          <IconBox icon={Icon} tone={tone} size="sm" />
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="tnum text-[27px] font-semibold leading-none tracking-[-0.035em] text-foreground">{value}</span>
          {unit && <span className="text-[12px] font-medium text-subtle">{unit}</span>}
        </div>

        {caption && <p className="mt-auto truncate text-[11.5px] leading-tight text-subtle">{caption}</p>}
      </div>

      {/* The band is reserved on every tile whether or not it carries a spark.
       * Reserving it only where there is one rendered the row at two different
       * heights and floated the captions out of line; drawing the spark over
       * the caption instead cost legibility. A uniform reservation buys both,
       * and keeps the sparkline out of the text rather than behind it. */}
      <div className="h-[24px] shrink-0">
        {hasSpark && (
          <Sparkline
            data={spark!}
            height={24}
            color={sparkColor}
            className="opacity-70 transition-opacity duration-150 group-hover:opacity-100"
          />
        )}
      </div>
    </>
  );

  const shell = cn(
    'group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface text-left',
    'transition-colors duration-150',
    interactive && cn('cursor-pointer hover:border-border-strong hover:bg-surface-raised', INTERACTIVE_RING),
  );

  return interactive ? (
    <button type="button" onClick={onClick} className={shell}>
      {content}
    </button>
  ) : (
    <div className={shell}>{content}</div>
  );
}

/* ---------------------------------------------------------------- secondary */

export interface MetricCellProps {
  label: string;
  value: ReactNode;
  unit?: string;
  caption?: ReactNode;
  /** Renders a status dot ahead of the figure. Always paired with the caption
   *  text, so the state is never carried by colour alone. */
  tone?: Tone;
  onClick?: () => void;
}

/* The strip deliberately carries no sparklines. A cell is only three lines
 * tall, so an absolutely-positioned spark lands on the caption — the exact
 * text-behind-chart problem the tiles above reserve a band to avoid — and
 * reserving one here would cost the density that makes the strip worth
 * having. Trends belong to the primary tiles; the strip states figures. */

export function MetricStrip({ items, className }: { items: MetricCellProps[]; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item, i) => (
        <MetricCell key={item.label} {...item} index={i} />
      ))}
    </div>
  );
}

function MetricCell({ label, value, unit, caption, tone, onClick, index }: MetricCellProps & { index: number }) {
  const interactive = Boolean(onClick);

  const content = (
    <>
      <p className="truncate text-[10px] font-semibold uppercase leading-none tracking-[0.11em] text-subtle">{label}</p>

      <div className="flex items-baseline gap-1.5">
        {tone && <span aria-hidden className={cn('mb-[3px] h-1.5 w-1.5 shrink-0 rounded-full', TONE_DOT[tone])} />}
        <span className="tnum text-[17px] font-semibold leading-none tracking-[-0.02em] text-foreground">{value}</span>
        {unit && <span className="text-[11px] font-medium text-subtle">{unit}</span>}
      </div>

      {caption && <p className="truncate text-[11px] leading-tight text-subtle">{caption}</p>}
    </>
  );

  const shell = cn(
    'relative flex min-w-0 flex-col gap-2 px-4 pb-3.5 pt-3 text-left transition-colors duration-150',
    // One strip, two shapes: two columns on small screens, four from lg. The
    // dividers are drawn per cell so the container keeps a single outer border
    // rather than gaining one per metric.
    'border-border-subtle',
    index % 2 === 1 && 'border-l',
    index >= 2 && 'border-t lg:border-t-0',
    index > 0 && 'lg:border-l',
    interactive && cn('cursor-pointer hover:bg-surface-raised', INTERACTIVE_RING),
  );

  return interactive ? (
    <button type="button" onClick={onClick} className={shell}>
      {content}
    </button>
  ) : (
    <div className={shell}>{content}</div>
  );
}
