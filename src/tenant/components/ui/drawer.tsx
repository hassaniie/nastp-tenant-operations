import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { DialogOverlay, useOverlayFocus } from './dialog';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export const DrawerContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: 'right' | 'left'; width?: string }>(
  ({ className, children, side = 'right', width = '520px', ...props }, ref) => { const focus = useOverlayFocus(props); return <DialogPrimitive.Portal><DialogOverlay /><DialogPrimitive.Content ref={ref} style={{ width, maxWidth: '100vw' }} className={cn(
    'fixed inset-y-0 z-[var(--z-modal)] flex flex-col border-border bg-surface shadow-[var(--shadow-lg)]', side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
    'data-[state=open]:animate-[slide-in_0.3s_cubic-bezier(0.22,1,0.36,1)]', className,
  )} {...props} {...focus}>{children}</DialogPrimitive.Content></DialogPrimitive.Portal>; },
);
DrawerContent.displayName = 'DrawerContent';

export function DrawerHeader({ title, subtitle, badge, actions }: { title: ReactNode; subtitle?: ReactNode; badge?: ReactNode; actions?: ReactNode }) {
  return <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4"><div className="min-w-0"><div className="flex flex-col items-start gap-3"><DialogPrimitive.Title className="text-[16px] font-semibold tracking-[-0.01em] text-foreground">{title}</DialogPrimitive.Title>{badge}</div><DialogPrimitive.Description className={subtitle ? 'mt-1 text-[13px] text-subtle' : 'sr-only'}>{subtitle ?? 'Details and available actions.'}</DialogPrimitive.Description></div><div className="flex shrink-0 items-center gap-1.5">{actions}<DialogPrimitive.Close className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-raised hover:text-foreground"><X className="h-4 w-4" /><span className="sr-only">Close panel</span></DialogPrimitive.Close></div></div>;
}
export function DrawerBody({ className, children }: { className?: string; children: ReactNode }) { return <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-4', className)}>{children}</div>; }
export function DrawerFooter({ className, children }: { className?: string; children: ReactNode }) { return <div className={cn('flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface px-5 py-4', className)}>{children}</div>; }
