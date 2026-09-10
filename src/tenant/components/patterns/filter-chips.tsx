import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function FilterChips<T extends string>({ values, onChange, options, className }: { values: T[]; onChange: (values: T[]) => void; options: Array<{ value: T; label: ReactNode; dot?: string; count?: number }>; className?: string }) {
  const toggle = (value: T) => onChange(values.includes(value) ? values.filter((candidate) => candidate !== value) : [...values, value]);
  return <div className={cn('flex flex-wrap items-center gap-1.5', className)}>{options.map((option) => { const active = values.includes(option.value); return <button key={option.value} onClick={() => toggle(option.value)} aria-pressed={active} className={cn('inline-flex h-8 items-center gap-1.5 rounded border px-3 text-[12px] font-medium transition-all', active ? 'border-primary/40 bg-primary-muted text-foreground' : 'border-border bg-surface-inset text-subtle hover:border-border-strong hover:text-muted')}>{option.dot && <span className="h-1.5 w-1.5 rounded" style={{ background: option.dot }} />}{option.label}{option.count !== undefined && <span className="tnum rounded bg-surface px-1 text-[11px] text-subtle">{option.count}</span>}</button>; })}</div>;
}
