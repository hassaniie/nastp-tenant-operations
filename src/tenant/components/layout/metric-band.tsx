import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function MetricBand({ children, columns = 4, className }: { children: ReactNode; columns?: 2 | 3 | 4 | 5 | 6; className?: string }) {
  return <section className={cn('ds-metrics', `is-${columns}`, className)} aria-label="Summary metrics">{children}</section>;
}
