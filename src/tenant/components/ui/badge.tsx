import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const badgeVariants = cva('inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium', {
  variants: {
    tone: {
      neutral: 'border border-border bg-neutral-dim text-muted', primary: 'border border-primary/25 bg-primary-muted text-primary',
      success: 'border border-success/25 bg-success-dim text-success', warning: 'border border-warning/25 bg-warning-dim text-warning',
      critical: 'border border-critical/25 bg-critical-dim text-critical', info: 'border border-info/25 bg-info-dim text-info',
      outline: 'border border-border-strong text-muted',
    },
    size: { sm: 'px-1.5 py-0 text-[11px]', md: '' },
  },
  defaultVariants: { tone: 'neutral', size: 'md' },
});

export function Badge({ className, tone, size, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
