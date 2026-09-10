import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useFieldControl } from './field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { invalid?: boolean }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...props }, ref) => {
  const field = useFieldControl({ ...props, invalid });
  return <textarea ref={ref} className={cn(
    'w-full rounded-[var(--radius-control)] border bg-surface px-3 py-2.5 text-[14px] text-foreground',
    'placeholder:text-subtle outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
    field['aria-invalid'] ? 'border-critical' : 'border-border', className,
  )} {...props} {...field} />;
});
Textarea.displayName = 'Textarea';
