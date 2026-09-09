/** Page scaffolding — spacing rhythm rebuilt on the preset's scale. */
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-5 py-6 lg:px-8', className)}>{children}</div>;
}
export function PageFull({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex w-full flex-col gap-6 px-5 py-6 lg:px-8', className)}>{children}</div>;
}
export function Toolbar({ children, className, sticky }: { children: ReactNode; className?: string; sticky?: boolean }) {
  return <div className={cn('flex flex-wrap items-center gap-2', sticky && 'bg-background/90 sticky top-0 z-20 py-2 backdrop-blur', className)}>{children}</div>;
}
export function Spacer() { return <div className="flex-1" />; }
export function StatGrid({ children, className, cols = 4 }: { children: ReactNode; className?: string; cols?: 2 | 3 | 4 | 5 | 6 }) {
  const map = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 xl:grid-cols-4', 5: 'sm:grid-cols-2 xl:grid-cols-5', 6: 'sm:grid-cols-3 xl:grid-cols-6' };
  return <div className={cn('grid grid-cols-1 gap-4 [&>*]:min-w-0', map[cols], className)}>{children}</div>;
}
export function ContentGrid({ children, className, cols = 2, align = 'stretch' }: { children: ReactNode; className?: string; cols?: 2 | 3; align?: 'stretch' | 'start' }) {
  return <div className={cn('grid gap-5 [&>*]:min-w-0', cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2', align === 'start' && 'items-start', className)}>{children}</div>;
}
export function SplitGrid({ children, className, ratio = 'balanced', at = 'xl' }: { children: ReactNode; className?: string; ratio?: 'balanced' | 'wide' | 'aside'; at?: 'lg' | 'xl' }) {
  const cols = {
    balanced: { lg: 'lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]', xl: 'xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]' },
    wide: { lg: 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]', xl: 'xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' },
    aside: { lg: 'lg:grid-cols-[320px_minmax(0,1fr)]', xl: 'xl:grid-cols-[320px_minmax(0,1fr)]' },
  };
  return <div className={cn('grid gap-5 [&>*]:min-w-0', cols[ratio][at], className)}>{children}</div>;
}
