import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Segmented<T extends string>({ value, onChange, options, size = 'md', className }: { value: T; onChange: (value: T) => void; options: Array<{ value: T; label: ReactNode; icon?: ReactNode; disabled?: boolean }>; size?: 'sm' | 'md'; className?: string }) {
  return <div role="group" aria-label="View mode" className={cn('inline-flex items-center gap-0.5 rounded-md border border-border bg-surface-inset p-0.5', className)}>{options.map((option) => { const active = option.value === value; return <button key={option.value} type="button" aria-pressed={active} disabled={option.disabled} onClick={() => onChange(option.value)} className={cn('inline-flex items-center gap-1.5 rounded-md font-medium transition-all duration-150 disabled:opacity-40', size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3 text-[13px]', active ? 'bg-surface-raised text-foreground shadow-[var(--shadow-sm)]' : 'text-subtle hover:text-foreground')}>{option.icon}{option.label}</button>; })}</div>;
}
