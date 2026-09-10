import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';
import { useFieldControl } from './field';

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(({ className, ...props }, ref) => {
  const field = useFieldControl(props);
  return <SwitchPrimitive.Root ref={ref} className={cn(
    'peer inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
    'data-[state=checked]:bg-primary data-[state=unchecked]:border-border data-[state=unchecked]:bg-surface disabled:cursor-not-allowed disabled:opacity-50', className,
  )} {...props} {...field}><SwitchPrimitive.Thumb className="pointer-events-none block h-[16px] w-[16px] rounded-full bg-primary-foreground shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[21px] data-[state=unchecked]:translate-x-[3px]" /></SwitchPrimitive.Root>;
});
Switch.displayName = 'Switch';
