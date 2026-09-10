import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useFieldControl } from './field';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectTrigger = forwardRef<ElementRef<typeof SelectPrimitive.Trigger>, ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'md' }>(
  ({ className, children, size = 'md', ...props }, ref) => { const field = useFieldControl(props); return <SelectPrimitive.Trigger ref={ref} className={cn(
    'flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-border bg-surface px-3 text-[13px] text-foreground outline-none transition-colors',
    'hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20 data-[placeholder]:text-subtle disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-critical',
    size === 'sm' ? 'h-8 text-[13px]' : 'h-9', className,
  )} {...props} {...field}>{children}<SelectPrimitive.Icon asChild><ChevronDown className="h-3.5 w-3.5 shrink-0 text-subtle" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>; },
);
SelectTrigger.displayName = 'SelectTrigger';
export const SelectContent = forwardRef<ElementRef<typeof SelectPrimitive.Content>, ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
  ({ className, children, position = 'popper', ...props }, ref) => <SelectPrimitive.Portal><SelectPrimitive.Content ref={ref} position={position} sideOffset={6} className={cn(
    'z-[80] max-h-72 min-w-[9rem] overflow-hidden rounded-[var(--radius-surface)] border border-border bg-surface-overlay p-1 shadow-[var(--shadow-lg)]',
    'data-[state=open]:animate-[fade-up_0.16s_cubic-bezier(0.22,1,0.36,1)]', className,
  )} {...props}><SelectPrimitive.Viewport className="p-0">{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>,
);
SelectContent.displayName = 'SelectContent';
export const SelectItem = forwardRef<ElementRef<typeof SelectPrimitive.Item>, ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
  ({ className, children, ...props }, ref) => <SelectPrimitive.Item ref={ref} className={cn(
    'relative flex cursor-pointer select-none items-center rounded-md py-2 pl-3 pr-8 text-[13px] text-muted outline-none',
    'data-[highlighted]:bg-surface-raised data-[highlighted]:text-foreground data-[state=checked]:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', className,
  )} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="absolute right-2.5"><Check className="h-3.5 w-3.5 text-primary" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>,
);
SelectItem.displayName = 'SelectItem';

export function SimpleSelect<T extends string>({ value, onChange, options, placeholder, size, className, label, disabled, invalid, id }: {
  value: T; onChange: (value: T) => void; options: Array<{ value: T; label: ReactNode; disabled?: boolean }>;
  label?: string; disabled?: boolean; invalid?: boolean; id?: string; placeholder?: string; size?: 'sm' | 'md'; className?: string;
}) {
  return <Select disabled={disabled} value={value} onValueChange={(next) => onChange(next as T)}><SelectTrigger size={size} className={className} aria-label={label} aria-invalid={invalid || undefined} id={id}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}</SelectContent></Select>;
}
