import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function WorkspaceActions({ children, message, className }: { children: ReactNode; message?: ReactNode; className?: string }) {
  return <div className={cn('ds-workspace-actions', className)}>{message && <span className="mr-auto text-xs text-subtle">{message}</span>}{children}</div>;
}
