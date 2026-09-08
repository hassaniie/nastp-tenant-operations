/**
 * Data surfaces: the table and the states every data view must be able to show
 * — loading, empty, error. These are components rather than copy-pasted markup
 * so a screen physically cannot forget one.
 *
 * The table renders through ReUI's `data-grid` (TanStack Table v9) while
 * keeping the `Column<T>` shape the pages already declare. The migration swaps
 * the engine, not the fifteen call sites: sorting, pagination, skeletons and
 * the header chrome are the grid's now, and the states below stay ours because
 * the grid has no concept of a failed fetch.
 */

import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useTable, type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { cn } from '../../lib/utils';
import { Button } from './primitives';
import { DataGrid, DataGridContainer, dataGridFeatures, type DataGridFeatures } from '../reui/data-grid/data-grid';
import { DataGridTable } from '../reui/data-grid/data-grid-table';
import { DataGridPagination } from '../reui/data-grid/data-grid-pagination';
import { DataGridColumnHeader } from '../reui/data-grid/data-grid-column-header';

/* ------------------------------------------------------------------- Table */

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  /** Classes for the body cell. */
  className?: string;
  /** Classes for the header cell — sizing a column lives here (e.g. `w-11`). */
  headerClassName?: string;
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
}

const HIDE: Record<NonNullable<Column<unknown>['hideBelow']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

const ALIGN_CELL = { left: '', right: 'text-right', center: 'text-center' } as const;
const ALIGN_HEAD = { left: '', right: 'justify-end', center: 'justify-center' } as const;

export function DataTable<T extends object>({
  rows,
  columns,
  rowKey,
  onRowClick,
  loading,
  error,
  onRetry,
  emptyTitle = 'Nothing to show',
  emptyDescription,
  emptyAction,
  emptyIcon,
  pageSize = 0,
  stickyHeader = true,
  dense,
  className,
  selectedKey,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  emptyIcon?: ReactNode;
  pageSize?: number;
  stickyHeader?: boolean;
  dense?: boolean;
  className?: string;
  selectedKey?: string;
}) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: pageSize || 10 });
  const pageSizeOptions = useMemo(() => Array.from(new Set([pageSize, 10, 25, 50, 100])).sort((a, b) => a - b), [pageSize]);

  const gridColumns = useMemo<ColumnDef<DataGridFeatures, T>[]>(
    () =>
      columns.map((col) => {
        const align = col.align ?? 'left';
        const hidden = col.hideBelow ? HIDE[col.hideBelow] : undefined;
        const sortable = Boolean(col.sortValue);
        const title = typeof col.header === 'string' ? col.header : undefined;

        return {
          id: col.key,
          // The sort key doubles as the accessor: TanStack sorts on the
          // accessed value, which is exactly what `sortValue` already returns.
          ...(col.sortValue ? { accessorFn: (row: T) => col.sortValue!(row) } : {}),
          enableSorting: sortable,
          header: ({ column }) => (
            <div className={cn('flex w-full items-center', ALIGN_HEAD[align])}>
              {sortable ? <DataGridColumnHeader column={column} title={title} /> : col.header}
            </div>
          ),
          cell: ({ row }) => col.cell(row.original, row.index),
          meta: {
            headerTitle: title ?? col.key,
            headerClassName: cn(hidden, col.headerClassName),
            cellClassName: cn(hidden, ALIGN_CELL[align], col.className),
          },
        };
      }),
    [columns],
  );

  const table = useTable({
    features: dataGridFeatures,
    data: rows,
    columns: gridColumns,
    getRowId: (row: T, index: number) => rowKey(row, index),
    // `dataGridFeatures` always registers the paginated row model, so a grid
    // that must show every row has to opt out of it rather than omit a page size.
    ...(pageSize > 0 ? { onPaginationChange: setPagination } : { manualPagination: true }),
    // Drives the `data-state=selected` styling only; no selection column is
    // rendered, so this stays a highlight rather than a checkbox affordance.
    enableRowSelection: true,
    state: {
      ...(pageSize > 0 ? { pagination } : {}),
      rowSelection: selectedKey ? { [selectedKey]: true } : {},
    },
  });

  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <DataGrid
        table={table}
        recordCount={rows.length}
        isLoading={loading}
        loadingMode="skeleton"
        onRowClick={onRowClick}
        emptyMessage={<EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} icon={emptyIcon} />}
        tableLayout={{
          dense,
          headerSticky: stickyHeader,
          headerBackground: true,
          width: 'auto',
          rowBorder: true,
        }}
        tableClassNames={{
          bodyRow: cn(
            'text-[13px] text-muted-foreground',
            onRowClick && 'cursor-pointer',
            'data-[state=selected]:bg-primary-muted/40',
          ),
          headerRow: 'bg-surface-inset',
        }}
      >
        <DataGridContainer className="min-h-0 flex-1">
          <DataGridTable />
        </DataGridContainer>
        {/* ReUI's default size list is [5,10,25,50,100]; the pages here ask for
            12, 13, 14 and 20, and a size outside the list leaves the selector
            rendering blank. Seed it with whatever this table actually uses. */}
        {pageSize > 0 && rows.length > pageSize && <DataGridPagination sizes={pageSizeOptions} />}
      </DataGrid>
    </div>
  );
}

/* ------------------------------------------------------------------ States */

export function EmptyState({ title, description, action, icon, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-raised text-subtle">{icon ?? <Inbox className="h-5 w-5" />}</div>
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
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-critical/25 bg-critical-dim/40 text-center', compact ? 'px-4 py-5' : 'px-6 py-12', className)} role="alert">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-critical/30 bg-critical-dim text-critical">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[14px] font-medium text-foreground">Could not load this data</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-muted-foreground">{message}</p>
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
      <div className="relative h-9 w-9">
        <span className="absolute inset-0 rounded-full border-2 border-border" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
      </div>
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
    <dl className={cn('grid gap-x-6 gap-y-4', columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3', className)}>
      {items.map((item, i) => (
        <div key={i} className={cn('min-w-0', item.span && 'col-span-full')}>
          <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-subtle">{item.label}</dt>
          <dd className="mt-1 text-[13px] text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
