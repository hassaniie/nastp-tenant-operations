/** Data presentation — the preset's Table, Empty and Alert surfaces. */
import { useMemo, useState, type ReactNode } from 'react';
import { AlertCircleIcon, ChevronDown, ChevronUp, Loader2, RotateCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../ui/empty';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
}

const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' } as const;

export function DataTable<T>({
  rows, columns, rowKey, onRowClick, loading, error, onRetry,
  emptyTitle = 'Nothing to show', emptyDescription, emptyAction, emptyIcon,
  pageSize = 0, stickyHeader: _sticky = true, dense, className, selectedKey,
}: {
  rows: T[]; columns: Column<T>[]; rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void; loading?: boolean; error?: string; onRetry?: () => void;
  emptyTitle?: string; emptyDescription?: string; emptyAction?: ReactNode; emptyIcon?: ReactNode;
  pageSize?: number; stickyHeader?: boolean; dense?: boolean; className?: string; selectedKey?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const out = [...rows].sort((a, b) => {
      const av = col.sortValue!(a), bv = col.sortValue!(b);
      return av === bv ? 0 : (av < bv ? -1 : 1) * (sort.dir === 'asc' ? 1 : -1);
    });
    return out;
  }, [rows, sort, columns]);

  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const view = pageSize > 0 ? sorted.slice(page * pageSize, page * pageSize + pageSize) : sorted;

  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (loading && rows.length === 0) {
    return (
      <div className={cn('flex flex-col gap-2 p-4', className)}>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }
  if (!loading && sorted.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} icon={emptyIcon} />;
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={cn(
                    c.hideBelow && HIDE[c.hideBelow],
                    c.align === 'right' && 'text-right', c.align === 'center' && 'text-center',
                    c.sortValue && 'cursor-pointer select-none',
                  )}
                  onClick={c.sortValue ? () => setSort((s) => s?.key === c.key ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: c.key, dir: 'asc' }) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {sort?.key === c.key && (sort.dir === 'asc' ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />)}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.map((row, i) => {
              const k = rowKey(row, i);
              return (
                <TableRow
                  key={k}
                  data-state={selectedKey === k ? 'selected' : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer', dense && '[&>td]:py-1.5')}
                >
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      className={cn(c.hideBelow && HIDE[c.hideBelow], c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', c.className)}
                    >
                      {c.cell(row, i)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {pageSize > 0 && pageCount > 1 && (
        <Pagination page={page} pageCount={pageCount} total={sorted.length} pageSize={pageSize} onChange={setPage} />
      )}
    </div>
  );
}

export function Pagination({ page, pageCount, total, pageSize, onChange }: { page: number; pageCount: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-muted-foreground text-sm tabular-nums">
        {page * pageSize + 1}–{Math.min(total, (page + 1) * pageSize)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action, icon, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        {icon && <EmptyMedia variant="icon">{icon}</EmptyMedia>}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

export function ErrorState({ message, onRetry, className, compact }: { message: string; onRetry?: () => void; className?: string; compact?: boolean }) {
  return (
    <Alert variant="destructive" className={cn(compact && 'py-2', className)}>
      <AlertCircleIcon />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>
        {message}
        {onRetry && <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={onRetry}><RotateCw />Retry</Button>}
      </AlertDescription>
    </Alert>
  );
}

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm', className)}>
      <Loader2 className="size-4 animate-spin" />{label}
    </div>
  );
}

export function AsyncBoundary({ status, error, onRetry, children, loadingLabel, empty }: {
  status: 'idle' | 'loading' | 'success' | 'error'; error?: string; onRetry?: () => void;
  children: ReactNode; loadingLabel?: string; empty?: ReactNode;
}) {
  if (status === 'error' && error) return <ErrorState message={error} onRetry={onRetry} />;
  if (status === 'loading') return <LoadingState label={loadingLabel} />;
  if (status === 'idle' && empty) return <>{empty}</>;
  return <>{children}</>;
}

export function DefList({ items, columns = 2, className }: { items: Array<{ label: ReactNode; value: ReactNode; span?: boolean }>; columns?: 1 | 2 | 3; className?: string }) {
  const map = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };
  return (
    <dl className={cn('grid grid-cols-1 gap-x-6 gap-y-4', map[columns], className)}>
      {items.map((it, i) => (
        <div key={i} className={cn('min-w-0', it.span && 'sm:col-span-full')}>
          <dt className="text-muted-foreground text-xs">{it.label}</dt>
          <dd className="mt-1 text-sm font-medium">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
