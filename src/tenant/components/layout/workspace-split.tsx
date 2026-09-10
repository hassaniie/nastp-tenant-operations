import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function WorkspaceSplit({ children, ratio = 'balanced', className }: { children: ReactNode; ratio?: 'balanced' | 'wide' | 'equal'; className?: string }) {
  return <div className={cn('ds-workspace-split', `is-${ratio}`, className)}>{children}</div>;
}
