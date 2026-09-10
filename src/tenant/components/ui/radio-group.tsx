import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useFieldControl } from './field';

export const Radio = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Radio({ className, ...props }, ref) {
  return <input {...props} ref={ref} type="radio" className={cn('size-4 accent-primary disabled:opacity-50', className)} />;
});
export function RadioGroup<T extends string>({ value, onChange, options, label, disabled, className }: {
  value: T; onChange: (value: T) => void; options: Array<{ value: T; label: ReactNode; disabled?: boolean }>; label?: string; disabled?: boolean; className?: string;
}) {
  const name = useId(); const field = useFieldControl({});
  return <div {...field} role="radiogroup" aria-label={label} aria-labelledby={!label && field.id ? `${field.id}-label` : undefined} className={cn('flex flex-wrap gap-4', className)}>{options.map((option) => <label key={option.value} className="inline-flex items-center gap-2 text-sm text-muted"><Radio name={name} value={option.value} checked={value === option.value} disabled={disabled || option.disabled} onChange={() => onChange(option.value)} />{option.label}</label>)}</div>;
}
