import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';
import { useFieldControl } from './field';

export const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(({ className, ...props }, ref) => {
  const field = useFieldControl(props);
  return <CheckboxPrimitive.Root ref={ref} className={cn(
    'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border border-border-strong bg-surface outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40',
    'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary disabled:cursor-not-allowed disabled:opacity-50', className,
  )} {...props} {...field}><CheckboxPrimitive.Indicator>{props.checked === 'indeterminate' ? <Minus className="h-3 w-3 text-primary-foreground" /> : <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}</CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>;
});
Checkbox.displayName = 'Checkbox';
