import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef, useRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function useOverlayFocus(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  const origin = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: (event: Event) => { origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; props.onOpenAutoFocus?.(event); },
    onCloseAutoFocus: (event: Event) => {
      props.onCloseAutoFocus?.(event);
      if (!event.defaultPrevented && origin.current?.isConnected && origin.current !== document.body) { event.preventDefault(); origin.current.focus(); }
    },
  };
}

export const DialogOverlay = forwardRef<ElementRef<typeof DialogPrimitive.Overlay>, ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => <DialogPrimitive.Overlay ref={ref} className={cn('fixed inset-0 z-[var(--z-overlay)] bg-[var(--overlay-scrim)] data-[state=open]:animate-[fade-in_0.2s_ease-out]', className)} {...props} />,
);
DialogOverlay.displayName = 'DialogOverlay';

export const DialogContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { size?: 'sm' | 'md' | 'lg' | 'xl' }>(
  ({ className, children, size = 'md', ...props }, ref) => { const focus = useOverlayFocus(props); return <DialogPrimitive.Portal><DialogOverlay /><DialogPrimitive.Content ref={ref} className={cn(
    'fixed left-1/2 top-1/2 z-[var(--z-modal)] flex max-h-[90dvh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden',
    'rounded-[var(--radius-overlay)] border border-border bg-surface-overlay shadow-[var(--shadow-lg)] data-[state=open]:animate-[fade-up_0.24s_cubic-bezier(0.22,1,0.36,1)]',
    { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size], className,
  )} {...props} {...focus}>{children}</DialogPrimitive.Content></DialogPrimitive.Portal>; },
);
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ title, description, icon }: { title: ReactNode; description?: ReactNode; icon?: ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4"><div className="flex items-start gap-3">{icon}<div><DialogPrimitive.Title className="text-[15px] font-semibold text-foreground">{title}</DialogPrimitive.Title><DialogPrimitive.Description className={description ? 'mt-1 text-[13px] leading-relaxed text-muted' : 'sr-only'}>{description ?? 'Review and complete this action.'}</DialogPrimitive.Description></div></div><DialogPrimitive.Close className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-raised hover:text-foreground"><X className="h-4 w-4" /><span className="sr-only">Close</span></DialogPrimitive.Close></div>;
}
export function DialogBody({ className, children }: { className?: string; children: ReactNode }) { return <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-4', className)}>{children}</div>; }
export function DialogFooter({ className, children }: { className?: string; children: ReactNode }) { return <div className={cn('flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface px-5 py-4', className)}>{children}</div>; }
