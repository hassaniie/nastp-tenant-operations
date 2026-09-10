import * as PopoverPrimitive from '@radix-ui/react-popover';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = forwardRef<ElementRef<typeof PopoverPrimitive.Content>, ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(
  ({ className, align = 'end', sideOffset = 8, ...props }, ref) => <PopoverPrimitive.Portal><PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn(
    'z-[85] w-72 max-w-[calc(100vw-2rem)] rounded-[var(--radius-overlay)] border border-border bg-surface-overlay p-1.5 shadow-[var(--shadow-lg)]',
    'data-[state=open]:animate-[fade-up_0.18s_cubic-bezier(0.22,1,0.36,1)]', className,
  )} {...props} /></PopoverPrimitive.Portal>,
);
PopoverContent.displayName = 'PopoverContent';
