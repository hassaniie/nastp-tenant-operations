import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Toolbar({ children, className, sticky }: { children: ReactNode; className?: string; sticky?: boolean }) {
  return <div className={cn('flex flex-wrap items-center gap-3', sticky && 'sticky top-0 z-20 -mx-4 bg-canvas/85 px-4 py-2.5 backdrop-blur lg:-mx-6 lg:px-6', className)}>{children}</div>;
}
export function Spacer() { return <div className="flex-1" />; }
