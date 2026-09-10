import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '../../lib/utils';

export const Tabs = TabsPrimitive.Root;
export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={cn('inline-flex items-center gap-1 rounded-md border border-border bg-surface-inset p-1', className)} {...props} />);
TabsList.displayName = 'TabsList';
export const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({ className, ...props }, ref) => <TabsPrimitive.Trigger ref={ref} className={cn('inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-medium text-subtle transition-all outline-none hover:text-foreground', 'data-[state=active]:bg-surface-raised data-[state=active]:text-foreground data-[state=active]:shadow-[var(--shadow-sm)]', className)} {...props} />);
TabsTrigger.displayName = 'TabsTrigger';
export const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn('outline-none data-[state=active]:animate-[fade-up_0.28s_cubic-bezier(0.22,1,0.36,1)]', className)} {...props} />);
TabsContent.displayName = 'TabsContent';
