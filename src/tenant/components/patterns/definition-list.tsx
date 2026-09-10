import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function DefList({ items, columns = 2, className }: { items: Array<{ label: ReactNode; value: ReactNode; span?: boolean }>; columns?: 1 | 2 | 3; className?: string }) {
  return <dl className={cn('grid gap-x-6 gap-y-4', columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 min-[360px]:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3', className)}>{items.map((item, index) => <div key={index} className={cn('min-w-0', item.span && 'col-span-full')}><dt className="text-xs font-medium text-subtle">{item.label}</dt><dd className="mt-1 text-[13px] text-foreground">{item.value}</dd></div>)}</dl>;
}
