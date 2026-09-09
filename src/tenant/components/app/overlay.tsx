/** Overlays — preset Dialog / Sheet / Popover / DropdownMenu / Tooltip. */
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import {
  Dialog as D, DialogTrigger as DT, DialogClose as DC, DialogContent as DCon,
  DialogHeader as DH, DialogTitle, DialogDescription, DialogFooter as DF,
} from '../ui/dialog';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../ui/sheet';
import { Popover as P, PopoverTrigger as PT, PopoverContent as PC } from '../ui/popover';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Tooltip as TP, TooltipTrigger, TooltipContent, TooltipProvider as TPr } from '../ui/tooltip';
import { cn } from '../../lib/utils';

/* dialog */
export const Dialog = D;
export const DialogTrigger = DT;
export const DialogClose = DC;
const DIALOG_W = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' } as const;
export const DialogContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof DCon> & { size?: keyof typeof DIALOG_W }>(
  ({ size = 'md', className, ...props }, ref) => <DCon ref={ref} className={cn(DIALOG_W[size] ?? DIALOG_W.md, className)} {...props} />,
);
DialogContent.displayName = 'DialogContent';
export function DialogHeader({ title, description, icon }: { title: ReactNode; description?: ReactNode; icon?: ReactNode }) {
  return (
    <DH>
      <DialogTitle className="flex items-center gap-2">{icon}{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
    </DH>
  );
}
export function DialogBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-col gap-4', className)}>{children}</div>;
}
export const DialogFooter = DF;

/* drawer — the preset's right-side Sheet */
export const Drawer = Sheet;
export const DrawerTrigger = SheetTrigger;
export const DrawerClose = SheetClose;
export const DrawerContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof SheetContent> & { width?: string }>(
  ({ className, children, width, ...props }, ref) => (
    <SheetContent ref={ref} side="right" style={width ? { maxWidth: width } : undefined} className={cn('flex w-full flex-col gap-0 p-0 sm:max-w-[560px]', className)} {...props}>{children}</SheetContent>
  ),
);
DrawerContent.displayName = 'DrawerContent';
export function DrawerHeader({ title, subtitle, badge, actions }: { title: ReactNode; subtitle?: ReactNode; badge?: ReactNode; actions?: ReactNode }) {
  return (
    <SheetHeader className="border-b">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <SheetTitle className="flex items-center gap-2">{title}{badge}</SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
    </SheetHeader>
  );
}
export function DrawerBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto p-5', className)}>{children}</div>;
}
export function DrawerFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <SheetFooter className={cn('border-t', className)}>{children}</SheetFooter>;
}

/* tooltip */
export const TooltipProvider = TPr;
export function Tooltip({ content, children, side = 'top', delay: _delay, className }: {
  content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right'; delay?: number; className?: string;
}) {
  return (
    <TP>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className={className}>{content}</TooltipContent>
    </TP>
  );
}

/* popover + menu */
export const Popover = P;
export const PopoverTrigger = PT;
export const PopoverContent = PC;
export const Menu = DropdownMenu;
export const MenuTrigger = DropdownMenuTrigger;
export const MenuContent = DropdownMenuContent;
export const MenuItem = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof DropdownMenuItem> & { destructive?: boolean }>(
  ({ destructive, ...props }, ref) => <DropdownMenuItem ref={ref} variant={destructive ? 'destructive' : 'default'} {...props} />,
);
MenuItem.displayName = 'MenuItem';
export const MenuLabel = DropdownMenuLabel;
export const MenuSeparator = DropdownMenuSeparator;
