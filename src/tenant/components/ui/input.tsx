import { Search, X } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useFieldControl } from './field';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { invalid?: boolean }
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => {
  const field = useFieldControl({ ...props, invalid });
  return <input ref={ref} className={cn(
    'h-9 w-full rounded-[var(--radius-control)] border bg-surface px-3 text-[14px] text-foreground transition-colors',
    'placeholder:text-subtle outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
    field['aria-invalid'] ? 'border-critical' : 'border-border', className,
  )} {...props} {...field} />;
});
Input.displayName = 'Input';

export function SearchInput({ value, onChange, placeholder = 'Search…', className, autoFocus, size = 'md', label = placeholder }: {
  value: string; onChange: (value: string) => void; placeholder?: string; label?: string; className?: string; autoFocus?: boolean; size?: 'sm' | 'md' | 'lg';
}) {
  const field = useFieldControl({});
  const heights = { sm: 'h-8 text-[13px]', md: 'h-9 text-[14px]', lg: 'h-12 text-[15px]' };
  return <div className={cn('relative flex items-center', className)}>
    <Search className={cn('pointer-events-none absolute left-3.5 text-subtle', size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
    <input {...field} aria-label={label} type="search" value={value} autoFocus={autoFocus} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}
      className={cn('w-full rounded-[var(--radius-control)] border border-border bg-surface pl-9 pr-9 text-foreground', 'placeholder:text-subtle outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50', heights[size])} />
    {value && <button type="button" onClick={() => onChange('')} className="absolute right-3 rounded p-0.5 text-subtle transition-colors hover:text-foreground" aria-label="Clear search"><X className="h-3.5 w-3.5" /></button>}
  </div>;
}
