import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuContent = forwardRef<ElementRef<typeof DropdownPrimitive.Content>, ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>>(
  ({ className, align = 'end', sideOffset = 6, ...props }, ref) => <DropdownPrimitive.Portal><DropdownPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn(
    'z-[var(--z-popover)] min-w-[210px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-surface)] border border-border bg-surface-overlay p-1 shadow-[var(--shadow-lg)]',
    'data-[state=open]:animate-[fade-up_0.16s_cubic-bezier(0.22,1,0.36,1)]', className,
  )} {...props} /></DropdownPrimitive.Portal>,
);
DropdownMenuContent.displayName = 'DropdownMenuContent';
export const DropdownMenuItem = forwardRef<ElementRef<typeof DropdownPrimitive.Item>, ComponentPropsWithoutRef<typeof DropdownPrimitive.Item> & { destructive?: boolean }>(
  ({ className, destructive, ...props }, ref) => <DropdownPrimitive.Item ref={ref} className={cn(
    'flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] outline-none transition-colors',
    'data-[highlighted]:bg-surface-raised data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
    destructive ? 'text-critical data-[highlighted]:bg-critical-dim' : 'text-muted data-[highlighted]:text-foreground', className,
  )} {...props} />,
);
DropdownMenuItem.displayName = 'DropdownMenuItem';
export function DropdownMenuLabel({ children }: { children: ReactNode }) { return <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">{children}</div>; }
export const DropdownMenuSeparator = () => <DropdownPrimitive.Separator className="my-1 h-px bg-border" />;

/** Compatibility names retained while consumers migrate. */
export { DropdownMenu as Menu, DropdownMenuTrigger as MenuTrigger, DropdownMenuContent as MenuContent, DropdownMenuItem as MenuItem, DropdownMenuLabel as MenuLabel, DropdownMenuSeparator as MenuSeparator };
