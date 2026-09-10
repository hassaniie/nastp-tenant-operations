import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function StatGrid({ children, className, cols = 4 }: { children: ReactNode; className?: string; cols?: 2 | 3 | 4 | 5 | 6 }) {
  const columns = { 2: 'grid-cols-1 sm:grid-cols-2', 3: 'grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 lg:grid-cols-4', 5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5', 6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6' };
  return <div className={cn('grid gap-3', columns[cols], className)}>{children}</div>;
}
export function ContentGrid({ children, className, cols = 2, align = 'stretch' }: { children: ReactNode; className?: string; cols?: 2 | 3; align?: 'stretch' | 'start' }) {
  const columns = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' };
  return <div className={cn('grid gap-4', columns[cols], align === 'start' && 'items-start', className)}>{children}</div>;
}
export function SplitGrid({ children, className, ratio = 'balanced', at = 'xl' }: { children: ReactNode; className?: string; ratio?: 'balanced' | 'wide' | 'aside'; at?: 'lg' | 'xl' }) {
  const columns = { balanced: { lg: 'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]', xl: 'xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]' }, wide: { lg: 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]', xl: 'xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' }, aside: { lg: 'lg:grid-cols-[320px_minmax(0,1fr)]', xl: 'xl:grid-cols-[320px_minmax(0,1fr)]' } };
  return <div className={cn('grid gap-4', columns[ratio][at], className)}>{children}</div>;
}
