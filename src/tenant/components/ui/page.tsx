import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Page-level layout primitives.
 *
 * These exist so no screen defines its own page padding, section rhythm or
 * grid ratios. The spacing scale they encode:
 *
 *   12px  gap-3   component spacing   — KPI tiles, dense card rows
 *   16px  gap-4   comfortable spacing — content cards sitting side by side
 *   20px  gap-5   section spacing     — between top-level page sections
 *   24px  p-6     page-level padding  — the page gutter on desktop
 *
 * Anything outside that scale should be deliberate and local, not a new
 * default invented by a single screen.
 */

/** Standard page: centred, gutter, and a consistent section rhythm. */
export type PageArchetype = 'analytics' | 'data' | 'operational' | 'setup' | 'detail';

export function Page({ children, className, workspace, archetype }: { children: ReactNode; className?: string; workspace?: boolean; archetype?: PageArchetype }) {
  return (
    <div data-page-archetype={archetype} className={cn(workspace ? 'ds-workspace' : 'ds-contained-page mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 lg:p-6', className)}>
      {children}
    </div>
  );
}

/** Full-height page for screens that own their own scrolling (board, wall). */
export function PageFull({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('ds-contained-page flex h-full min-h-0 w-full flex-col gap-4 p-4 lg:p-6', className)}>
      {children}
    </div>
  );
}

/** Filter / action bar. `sticky` keeps it available over long tables. */
export function Toolbar({ children, className, sticky }: { children: ReactNode; className?: string; sticky?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3',
        sticky && 'sticky top-0 z-20 -mx-4 bg-canvas/85 px-4 py-2.5 backdrop-blur lg:-mx-6 lg:px-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Spacer() {
  return <div className="flex-1" />;
}

/** Responsive grid for KPI / metric tiles. Tighter gap — these read as a set. */
export function StatGrid({ children, className, cols = 4 }: { children: ReactNode; className?: string; cols?: 2 | 3 | 4 | 5 | 6 }) {
  const map = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
  };
  return <div className={cn('grid gap-3', map[cols], className)}>{children}</div>;
}

/**
 * Content cards side by side.
 *
 *   stretch  (default) peers of equal weight — two charts, two summaries. The
 *            cards share a height because they are the same kind of thing.
 *   start    independent panels whose content genuinely varies in length — a
 *            building with two floors beside one with five. Stretching those
 *            to a common height strands the difference as empty space inside
 *            the shorter card, which reads as a bug rather than as breathing
 *            room. Sizing each to its content is the honest layout.
 */
export function ContentGrid({
  children,
  className,
  cols = 2,
  align = 'stretch',
}: {
  children: ReactNode;
  className?: string;
  cols?: 2 | 3;
  align?: 'stretch' | 'start';
}) {
  const map = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' };
  return <div className={cn('grid gap-4', map[cols], align === 'start' && 'items-start', className)}>{children}</div>;
}

/**
 * Primary content beside a supporting aside — the most repeated layout in the
 * product. One ratio set, so a chart never competes with its own sidebar and
 * two screens never disagree about what "primary" looks like.
 *
 *   balanced  ~3:2  default; a chart plus a supporting panel
 *   wide      ~2:1  a dominant primary with a narrow rail
 *   aside     fixed a narrow control/nav column ahead of the content
 */
export function SplitGrid({
  children,
  className,
  ratio = 'balanced',
  at = 'xl',
}: {
  children: ReactNode;
  className?: string;
  ratio?: 'balanced' | 'wide' | 'aside';
  at?: 'lg' | 'xl';
}) {
  // Every fr track is minmax(0,·). A bare `1fr` floors at the content's
  // min-content width, so one wide table inside a column pushes that column
  // past its share and the page scrolls sideways.
  const cols = {
    balanced: { lg: 'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]', xl: 'xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]' },
    wide: { lg: 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]', xl: 'xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' },
    aside: { lg: 'lg:grid-cols-[320px_minmax(0,1fr)]', xl: 'xl:grid-cols-[320px_minmax(0,1fr)]' },
  };
  return <div className={cn('grid gap-4', cols[ratio][at], className)}>{children}</div>;
}

/** List pages share a visible filter region and a single reset action. */
export function ListToolbar({ children, actions, summary, onReset }: { children: ReactNode; actions?: ReactNode; summary?: ReactNode; onReset?: () => void }) {
  return <div className="ds-list-toolbar"><div className="ds-list-filters" role="search" aria-label="Filter records">{children}</div><div className="ds-list-summary"><span role="status">{summary}</span><div className="flex items-center gap-3">{onReset && <button type="button" className="text-xs text-primary hover:underline" onClick={onReset}>Reset filters</button>}{actions}</div></div></div>;
}

/** Integrated page metric cells. Metrics align to the workspace grid rather
 * than becoming independent floating cards. */
export function MetricBand({ children, columns = 4, className }: { children: ReactNode; columns?: 2 | 3 | 4 | 5 | 6; className?: string }) {
  return <section className={cn('ds-metrics', `is-${columns}`, className)} aria-label="Summary metrics">{children}</section>;
}

/** A primary page region with shared dividers and no automatic card chrome. */
export function WorkspaceSection({ children, title, description, actions, className, inset = true }: {
  children: ReactNode; title?: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string; inset?: boolean;
}) {
  return <section className={cn('ds-workspace-section', inset && 'is-inset', className)}>
    {(title || description || actions) && <header className="ds-workspace-section-header"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{actions}</header>}
    <div className="ds-workspace-section-body">{children}</div>
  </section>;
}

/** Adjacent analytical/detail regions share a central rule and collapse in a
 * consistent order. */
export function WorkspaceSplit({ children, ratio = 'balanced', className }: { children: ReactNode; ratio?: 'balanced' | 'wide' | 'equal'; className?: string }) {
  return <div className={cn('ds-workspace-split', `is-${ratio}`, className)}>{children}</div>;
}

/** Stable setup footer: progress context stays above it and actions remain
 * predictable on long form steps. */
export function WorkspaceActions({ children, message, className }: { children: ReactNode; message?: ReactNode; className?: string }) {
  return <div className={cn('ds-workspace-actions', className)}>{message && <span className="mr-auto text-xs text-subtle">{message}</span>}{children}</div>;
}
/** Consistent detail sections and forms use actual children/actions, never invented workflow state. */
export function DetailSection({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return <section className="ds-detail-section"><div className="flex items-center justify-between gap-3"><h3>{title}</h3>{actions}</div><div>{children}</div></section>;
}
export function FormActions({ children, message }: { children: ReactNode; message?: ReactNode }) {
  return <div className="ds-form-actions">{message && <span role="status" className="mr-auto text-xs text-subtle">{message}</span>}{children}</div>;
}
