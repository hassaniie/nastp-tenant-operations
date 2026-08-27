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
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 lg:p-6', className)}>
      {children}
    </div>
  );
}

/** Full-height page for screens that own their own scrolling (board, wall). */
export function PageFull({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex h-full min-h-0 w-full flex-col gap-4 p-4 lg:p-6', className)}>
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
