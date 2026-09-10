import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { EmptyState, ErrorState } from '../patterns/feedback-state';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Pagination } from './pagination';
import { Skeleton } from './skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { pageRows, sortRows, togglePageSelection } from './table-model';

export interface Column<T> {
  key: string; header: ReactNode; cell: (row: T, index: number) => ReactNode;
  sortValue?: (row: T) => string | number; width?: string; align?: 'left' | 'right' | 'center'; className?: string; hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
}
const HIDE = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' };

export function DataTable<T>({ rows, columns, rowKey, onRowClick, loading, error, onRetry, emptyTitle = 'Nothing to show', emptyDescription, emptyAction, emptyIcon, pageSize = 0, stickyHeader = true, dense, className, selectedKey, label = 'Records', rowLabel, selection, onSelectionChange, bulkActions, resetKey }: {
  rows: T[]; columns: Column<T>[]; rowKey: (row: T, index: number) => string; onRowClick?: (row: T) => void;
  loading?: boolean; error?: string; onRetry?: () => void; emptyTitle?: string; emptyDescription?: string; emptyAction?: ReactNode; emptyIcon?: ReactNode;
  pageSize?: number; stickyHeader?: boolean; dense?: boolean; className?: string; selectedKey?: string; label?: string; rowLabel?: (row: T) => string;
  selection?: Set<string>; onSelectionChange?: (selection: Set<string>) => void; bulkActions?: ReactNode; resetKey?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [pagination, setPagination] = useState({ page: 0, resetKey });
  const sorted = useMemo(() => sortRows(rows, columns.find((column) => column.key === sort?.key)?.sortValue, sort?.dir), [rows, columns, sort]);
  const { count: pageCount, current, visible } = pageRows(sorted, pagination.resetKey === resetKey ? pagination.page : 0, pageSize);
  if (pagination.resetKey !== resetKey) setPagination({ page: 0, resetKey });
  const selectable = Boolean(selection && onSelectionChange);
  const visibleKeys = visible.map(rowKey);
  const pageSelected = visibleKeys.filter((key) => selection?.has(key)).length;
  const changeSort = (key: string) => { setSort((previous) => ({ key, dir: previous?.key === key && previous.dir === 'asc' ? 'desc' : 'asc' })); setPagination({ page: 0, resetKey }); };
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  return <div className={cn('ds-data-table flex min-h-0 flex-col', className)} aria-busy={loading || undefined}>
    {selectable && Boolean(selection?.size) && <div className="ds-bulk-actions"><span role="status">{selection!.size} selected</span>{bulkActions}<Button size="xs" variant="ghost" onClick={() => onSelectionChange!(new Set())}>Clear selection</Button></div>}
    <Table aria-label={label} className="w-full text-left"><TableHeader className={cn(stickyHeader && 'sticky top-0 z-10 bg-surface-inset')}><TableRow>{selectable && <TableHead className="w-10"><Checkbox aria-label="Select current page" disabled={loading || !visible.length} checked={pageSelected === visible.length && visible.length > 0 ? true : pageSelected ? 'indeterminate' : false} onCheckedChange={(value) => onSelectionChange!(togglePageSelection(selection!, visibleKeys, value === true))} /></TableHead>}{columns.map((column) => <TableHead key={column.key} style={{ width: column.width }} aria-sort={sort?.key === column.key ? sort.dir === 'asc' ? 'ascending' : 'descending' : column.sortValue ? 'none' : undefined} className={cn(column.hideBelow && HIDE[column.hideBelow], column.align === 'right' && 'text-right', column.align === 'center' && 'text-center')}>{column.sortValue ? <button type="button" className="inline-flex items-center gap-1 py-1 text-inherit hover:text-foreground" onClick={() => changeSort(column.key)}>{column.header}{sort?.key === column.key ? sort.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} /> : <ChevronsUpDown size={14} />}</button> : column.header}</TableHead>)}</TableRow></TableHeader>
      <TableBody>{loading ? Array.from({ length: 6 }, (_, index) => <TableRow key={index}>{selectable && <TableCell><Skeleton className="size-4" /></TableCell>}{columns.map((column) => <TableCell key={column.key} className={column.hideBelow && HIDE[column.hideBelow]}><Skeleton className="h-4 w-full max-w-40" /></TableCell>)}</TableRow>) : visible.map((row, index) => { const key = rowKey(row, index); return <TableRow key={key} data-state={selection?.has(key) || selectedKey === key ? 'selected' : undefined} tabIndex={onRowClick ? 0 : undefined} aria-label={onRowClick ? `Open ${rowLabel?.(row) ?? key}` : undefined} onKeyDown={onRowClick ? (event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onRowClick(row); } } : undefined} onClick={onRowClick ? (event) => { if (!(event.target as HTMLElement).closest('button,a,input,[role=checkbox]')) onRowClick(row); } : undefined} className={cn(onRowClick && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring')}>{selectable && <TableCell><Checkbox checked={selection!.has(key)} onCheckedChange={(checked) => onSelectionChange!(togglePageSelection(selection!, [key], checked === true))} aria-label={`Select ${rowLabel?.(row) ?? key}`} /></TableCell>}{columns.map((column) => <TableCell key={column.key} className={cn(dense ? 'py-2' : 'py-3.5', column.align === 'right' && 'text-right', column.align === 'center' && 'text-center', column.hideBelow && HIDE[column.hideBelow], column.className)}>{column.cell(row, index)}</TableCell>)}</TableRow>; })}</TableBody>
    </Table>
    {!loading && !visible.length && <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} icon={emptyIcon} />}
    {loading && <span role="status" className="sr-only">Loading {label.toLowerCase()}</span>}
    {pageSize > 0 && <Pagination page={current} pageCount={pageCount} total={sorted.length} pageSize={pageSize} onChange={(page) => setPagination({ page, resetKey })} />}
  </div>;
}
