import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export function Tooltip({ content, children, side = 'top', delay = 200, className }: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right'; delay?: number; className?: string }) {
  if (!content) return <>{children}</>;
  return <TooltipPrimitive.Root delayDuration={delay}><TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger><TooltipPrimitive.Portal><TooltipPrimitive.Content side={side} sideOffset={6} className={cn(
    'z-[90] max-w-[280px] rounded-lg border border-border bg-surface-overlay px-2.5 py-1.5 text-[12px] leading-snug text-foreground shadow-[var(--shadow-md)]',
    'data-[state=delayed-open]:animate-[fade-in_0.14s_ease-out]', className,
  )}>{content}</TooltipPrimitive.Content></TooltipPrimitive.Portal></TooltipPrimitive.Root>;
}
