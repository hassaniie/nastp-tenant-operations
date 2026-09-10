import { AlertTriangle, Inbox, RefreshCw, ShieldX } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

export function EmptyState({ title, description, action, icon, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}><div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface-raised text-subtle">{icon ?? <Inbox className="h-5 w-5" />}</div><div><p className="text-[14px] font-medium text-foreground">{title}</p>{description && <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-subtle">{description}</p>}</div>{action}</div>;
}

export function ErrorState({ message, onRetry, className, compact }: { message: string; onRetry?: () => void; className?: string; compact?: boolean }) {
  return <div className={cn('flex flex-col items-center justify-center gap-3 rounded-lg border border-critical/25 bg-surface text-center', compact ? 'px-4 py-5' : 'px-6 py-12', className)} role="alert"><div className="flex h-11 w-11 items-center justify-center rounded-lg border border-critical/30 bg-critical-dim text-critical"><AlertTriangle className="h-5 w-5" /></div><div><p className="text-[14px] font-medium text-foreground">Could not load this data</p><p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-muted">{message}</p></div>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}><RefreshCw className="h-3.5 w-3.5" />Retry</Button>}</div>;
}

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16', className)}><Spinner label={label} className="size-6" /><p className="text-[13px] text-subtle">{label}</p></div>;
}

export function AsyncBoundary({ status, error, onRetry, loadingFallback, isEmpty, emptyState, children }: {
  status: 'idle' | 'loading' | 'success' | 'error'; error?: string; onRetry?: () => void; loadingFallback?: ReactNode; isEmpty?: boolean; emptyState?: ReactNode; children: ReactNode;
}) {
  if (status === 'loading') return <>{loadingFallback ?? <LoadingState />}</>;
  if (status === 'error') return <ErrorState message={error ?? 'Unknown error'} onRetry={onRetry} />;
  if (isEmpty) return <>{emptyState ?? <EmptyState title="No records" />}</>;
  return <>{children}</>;
}

export function NoPermissionState({ description = 'Your account does not have access to this action.', action }: { description?: string; action?: ReactNode }) {
  return <EmptyState title="Access restricted" description={description} icon={<ShieldX className="size-5" />} action={action} />;
}
