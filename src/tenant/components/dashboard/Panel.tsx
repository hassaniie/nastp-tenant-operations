/**
 * Dashboard-local panel surface.
 *
 * Deliberately NOT a replacement for `components/ui/card` — that Card is used
 * by 38 files and stays exactly as it is. This is the refined surface the
 * Admin Dashboard pilot is drawn on, scoped to the pilot so the visual
 * direction can be judged before anything shared moves.
 *
 * What it changes, and why:
 *   • One radius. The app currently mixes twelve corner radii; Card sits at
 *     16px and StatCard at 15px, a 1px disagreement between the two panel
 *     types. Everything here uses the Tailwind scale — `rounded-xl` for
 *     panels, `rounded-lg` for rows — so the page reads as one system.
 *   • No `edge-light`. Card paints a decorative gradient hairline across its
 *     top edge. It carries no information, and at six panels per screen it is
 *     the page's loudest ornament.
 *   • No shadow. Elevation is carried by a border and a surface step instead,
 *     which holds up in both themes without the dark-mode shadow mud.
 *   • A tone rule instead of an icon box in the header. One 2px accent marks
 *     the module (energy / visitor / service) at a glance without adding a
 *     sixth tinted square to the screen.
 */

import type { ReactNode } from 'react';
import { TONE_DOT } from '../ui/primitives';
import { cn } from '../../lib/utils';
import type { Tone } from '../../lib/meta';

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface', className)}>
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  accent,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Module identity, drawn as a hairline rule rather than a tinted box. */
  accent?: Tone;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-4 py-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {accent && <span aria-hidden className={cn('h-[15px] w-[2px] shrink-0 rounded-full', TONE_DOT[accent])} />}
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-semibold leading-tight tracking-[-0.01em] text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-[11px] leading-tight text-subtle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  );
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('min-w-0 p-4', className)}>{children}</div>;
}

/**
 * A labelled band inside a panel.
 *
 * This is what lets two related charts share one container instead of
 * floating in two. Grouping by meaning rather than by widget is most of the
 * difference between an operations console and a wall of cards.
 */
export function PanelSection({
  title,
  actions,
  children,
  className,
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0 border-t border-border-subtle first:border-t-0', className)}>
      <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
        <h3 className="truncate text-[10px] font-semibold uppercase leading-none tracking-[0.11em] text-subtle">
          {title}
        </h3>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      <div className="min-w-0 px-4 pb-4 pt-2.5">{children}</div>
    </div>
  );
}
