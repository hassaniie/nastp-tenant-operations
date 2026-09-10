/** Canonical data surface: semantic table + controlled selection + keyboard sorting. */
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Inbox, RefreshCw, ShieldX } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button, Skeleton, Spinner } from './primitives';
import { Checkbox } from './form';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { sortRows, pageRows, togglePageSelection } from './table-model';

export interface Column<T> {
  key: string; header: ReactNode; cell: (row: T, index: number) => ReactNode;
  sortValue?: (row: T) => string | number; width?: string; align?: 'left' | 'right' | 'center';
  className?: string; hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
}
const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' };
export function DataTable<T>({ rows, columns, rowKey, onRowClick, loading, error, onRetry, emptyTitle = 'Nothing to show', emptyDescription,
  emptyAction, emptyIcon, pageSize = 0, stickyHeader = true, dense, className, selectedKey, label = 'Records', rowLabel,
  selection, onSelectionChange, bulkActions, resetKey,
}: {
  rows: T[]; columns: Column<T>[]; rowKey: (row: T, index: number) => string; onRowClick?: (row: T) => void;
  loading?: boolean; error?: string; onRetry?: () => void; emptyTitle?: string; emptyDescription?: string; emptyAction?: ReactNode; emptyIcon?: ReactNode;
  pageSize?: number; stickyHeader?: boolean; dense?: boolean; className?: string; selectedKey?: string; label?: string; rowLabel?: (row: T) => string;
  selection?: Set<string>; onSelectionChange?: (selection: Set<string>) => void; bulkActions?: ReactNode; resetKey?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [pagination, setPagination] = useState({ page: 0, resetKey });
  const sorted = useMemo(() => sortRows(rows, columns.find(c => c.key === sort?.key)?.sortValue, sort?.dir), [rows, columns, sort]);
  const { count: pageCount, current, visible } = pageRows(sorted, pagination.resetKey === resetKey ? pagination.page : 0, pageSize);
  // Commit the filter reset so returning to an earlier filter never revives its old page.
  if (pagination.resetKey !== resetKey) setPagination({ page: 0, resetKey });
  const selectable = Boolean(selection && onSelectionChange);
  const visibleKeys = visible.map(rowKey);
  const pageSelected = visibleKeys.filter(key => selection?.has(key)).length;
  const changeSort = (key: string) => { setSort(previous => ({ key, dir: previous?.key === key && previous.dir === 'asc' ? 'desc' : 'asc' })); setPagination({ page: 0, resetKey }); };
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  return <div className={cn('ds-data-table flex min-h-0 flex-col', className)} aria-busy={loading || undefined}>
    {selectable && Boolean(selection?.size) && <div className="ds-bulk-actions"><span role="status">{selection!.size} selected</span>{bulkActions}<Button size="xs" variant="ghost" onClick={() => onSelectionChange!(new Set())}>Clear selection</Button></div>}
    <Table aria-label={label} className="w-full text-left">
      <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10 bg-surface-inset')}><TableRow>
        {selectable && <TableHead className="w-10"><Checkbox aria-label="Select current page" disabled={loading || !visible.length} checked={pageSelected === visible.length && visible.length > 0 ? true : pageSelected ? 'indeterminate' : false} onCheckedChange={value => onSelectionChange!(togglePageSelection(selection!, visibleKeys, value === true))} /></TableHead>}
        {columns.map(col => <TableHead key={col.key} style={{ width: col.width }} aria-sort={sort?.key === col.key ? sort.dir === 'asc' ? 'ascending' : 'descending' : col.sortValue ? 'none' : undefined} className={cn(col.hideBelow && HIDE[col.hideBelow], col.align === 'right' && 'text-right', col.align === 'center' && 'text-center')}>
          {col.sortValue ? <button type="button" className="inline-flex items-center gap-1 py-1 text-inherit hover:text-foreground" onClick={() => changeSort(col.key)}>{col.header}{sort?.key === col.key ? sort.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} /> : <ChevronsUpDown size={14} />}</button> : col.header}
        </TableHead>)}
      </TableRow></TableHeader>
      <TableBody>{loading ? Array.from({ length: 6 }, (_, index) => <TableRow key={index}>{selectable && <TableCell><Skeleton className="size-4" /></TableCell>}{columns.map(col => <TableCell key={col.key} className={col.hideBelow && HIDE[col.hideBelow]}><Skeleton className="h-4 w-full max-w-40" /></TableCell>)}</TableRow>) : visible.map((row, index) => {
        const key = rowKey(row, index);
        return <TableRow key={key} data-state={selection?.has(key) || selectedKey === key ? 'selected' : undefined}
          tabIndex={onRowClick ? 0 : undefined} aria-label={onRowClick ? `Open ${rowLabel?.(row) ?? key}` : undefined}
          onKeyDown={onRowClick ? event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onRowClick(row); } } : undefined}
          onClick={onRowClick ? event => { if (!(event.target as HTMLElement).closest('button,a,input,[role=checkbox]')) onRowClick(row); } : undefined}
          className={cn(onRowClick && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2')}>
          {selectable && <TableCell><Checkbox checked={selection!.has(key)} onCheckedChange={checked => onSelectionChange!(togglePageSelection(selection!, [key], checked === true))} aria-label={`Select ${rowLabel?.(row) ?? key}`} /></TableCell>}
          {columns.map(col => <TableCell key={col.key} className={cn(dense ? 'py-2' : 'py-3.5', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center', col.hideBelow && HIDE[col.hideBelow], col.className)}>{col.cell(row, index)}</TableCell>)}
        </TableRow>;
      })}</TableBody>
    </Table>
    {!loading && !visible.length && <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} icon={emptyIcon} />}
    {loading && <span role="status" className="sr-only">Loading {label.toLowerCase()}</span>}
    {pageSize > 0 && <Pagination page={current} pageCount={pageCount} total={sorted.length} pageSize={pageSize} onChange={page => setPagination({ page, resetKey })} />}
  </div>;
}

/* -------------------------------------------------------------- Pagination */

export function Pagination({ page, pageCount, total, pageSize, onChange }: { page: number; pageCount: number; total: number; pageSize: number; onChange: (page: number) => void }) {
  const from = total ? page * pageSize + 1 : 0;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-border px-5 py-3">
      <p className="tnum text-[12px] text-subtle">
        {from}–{to} of {total.toLocaleString()}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="tnum px-2 text-[12px] text-muted">
          {page + 1} / {pageCount}
        </span>
        <Button variant="ghost" size="icon-sm" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ States */

export function EmptyState({ title, description, action, icon, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface-raised text-subtle">{icon ?? <Inbox className="h-5 w-5" />}</div>
      <div>
        <p className="text-[14px] font-medium text-foreground">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-subtle">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry, className, compact }: { message: string; onRetry?: () => void; className?: string; compact?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-lg border border-critical/25 bg-surface text-center', compact ? 'px-4 py-5' : 'px-6 py-12', className)} role="alert">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-critical/30 bg-critical-dim text-critical">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[14px] font-medium text-foreground">Could not load this data</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-muted">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16', className)}>
      <Spinner label={label} className="size-6" />
      <p className="text-[13px] text-subtle">{label}</p>
    </div>
  );
}

/** Wraps any async region: one place that decides which state renders. */
export function AsyncBoundary({
  status,
  error,
  onRetry,
  loadingFallback,
  isEmpty,
  emptyState,
  children,
}: {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  isEmpty?: boolean;
  emptyState?: ReactNode;
  children: ReactNode;
}) {
  if (status === 'loading') return <>{loadingFallback ?? <LoadingState />}</>;
  if (status === 'error') return <ErrorState message={error ?? 'Unknown error'} onRetry={onRetry} />;
  if (isEmpty) return <>{emptyState ?? <EmptyState title="No records" />}</>;
  return <>{children}</>;
}

/* --------------------------------------------------------- Definition list */

export function DefList({ items, columns = 2, className }: { items: Array<{ label: ReactNode; value: ReactNode; span?: boolean }>; columns?: 1 | 2 | 3; className?: string }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-4', columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 min-[360px]:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3', className)}>
      {items.map((item, i) => (
        <div key={i} className={cn('min-w-0', item.span && 'col-span-full')}>
          <dt className="text-xs font-medium text-subtle">{item.label}</dt>
          <dd className="mt-1 text-[13px] text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function NoPermissionState({ description = 'Your account does not have access to this action.', action }: { description?: string; action?: ReactNode }) {
  return <EmptyState title="Access restricted" description={description} icon={<ShieldX className="size-5" />} action={action} />;
}
