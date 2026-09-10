import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function KeyValue({ label, value, mono, className }: { label: ReactNode; value: ReactNode; mono?: boolean; className?: string }) {
  return <div className={cn('flex items-baseline justify-between gap-3 py-1.5', className)}><span className="shrink-0 text-[12px] text-subtle">{label}</span><span className={cn('truncate text-right text-[13px] font-medium text-foreground', mono && 'font-mono tnum')}>{value}</span></div>;
}
