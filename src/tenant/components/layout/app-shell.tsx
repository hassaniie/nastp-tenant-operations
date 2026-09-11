import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function AppShellFrame({ children, className, viewport = false }: { children: ReactNode; className?: string; viewport?: boolean }) {
  return <div className={cn('ds-app-shell flex w-full overflow-hidden bg-canvas text-foreground', viewport ? 'h-screen' : 'h-full', className)}>{children}</div>;
}

export function AppShellColumn({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-w-0 flex-1 flex-col', className)}>{children}</div>;
}

export function AppTopbar({ children, className }: { children: ReactNode; className?: string }) {
  return <header className={cn('ds-app-topbar flex h-[var(--topbar-height)] shrink-0 items-center gap-3 border-b border-border bg-background px-3 lg:px-5', className)}>{children}</header>;
}

export function AppMain({ children, className }: { children: ReactNode; className?: string }) {
  return <main id="main-scroll" className={cn('min-h-0 flex-1 overflow-y-auto', className)}>{children}</main>;
}
