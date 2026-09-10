import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type PageArchetype = 'analytics' | 'data' | 'operational' | 'setup' | 'detail';
export function Page({ children, className, workspace, archetype }: { children: ReactNode; className?: string; workspace?: boolean; archetype?: PageArchetype }) {
  return <div data-page-archetype={archetype} className={cn(workspace ? 'ds-workspace' : 'ds-contained-page mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 lg:p-6', className)}>{children}</div>;
}
export function PageFull({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('ds-contained-page flex h-full min-h-0 w-full flex-col gap-4 p-4 lg:p-6', className)}>{children}</div>;
}
