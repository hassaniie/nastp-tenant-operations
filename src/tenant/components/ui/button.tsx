// Canonical Button, consolidated from the public shadcn/ui Slot + CVA implementation (MIT).
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-control)] font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:shrink-0',
  { variants: {
    variant: {
      primary: 'bg-foreground text-surface hover:opacity-85 active:opacity-75',
      secondary: 'border border-border bg-surface text-foreground hover:bg-surface-raised active:bg-surface-inset',
      outline: 'border border-border bg-transparent text-foreground hover:bg-surface-raised',
      ghost: 'text-muted hover:bg-surface-raised hover:text-foreground',
      subtle: 'bg-surface-raised text-muted hover:text-foreground',
      danger: 'border border-critical/40 bg-critical-dim text-critical hover:border-critical',
      success: 'border border-success/40 bg-success-dim text-success hover:border-success',
    },
    size: {
      xs: 'h-7 gap-1.5 px-2.5 text-xs [&_svg]:size-3.5',
      sm: 'h-8 gap-1.5 px-3 text-[13px] [&_svg]:size-4',
      md: 'h-9 gap-2 px-4 text-sm [&_svg]:size-4',
      lg: 'h-11 gap-2 px-5 text-sm [&_svg]:size-4.5',
      icon: 'size-9 [&_svg]:size-4',
      'icon-sm': 'size-8 [&_svg]:size-4',
    },
  }, defaultVariants: { variant: 'secondary', size: 'md' } },
);
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, loading = false, disabled, children, onClick, type = 'button', ...props }, ref,
) {
  const blocked = Boolean(disabled || loading);
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props} ref={ref} type={asChild ? undefined : type}
    className={cn(buttonVariants({ variant, size }), blocked && 'opacity-45', className)}
    disabled={asChild ? undefined : blocked} aria-disabled={blocked || undefined} aria-busy={loading || undefined}
    tabIndex={asChild && blocked ? -1 : props.tabIndex}
    onClick={(event) => { if (blocked) { event.preventDefault(); return; } onClick?.(event); }}>
    {asChild ? children : <>{loading && <Loader2 aria-hidden className="animate-spin" />}{children}</>}
  </Comp>;
});
export const IconButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'size' | 'aria-label'> & { label: string; size?: 'sm' | 'md' }>(
  function IconButton({ label, size = 'md', ...props }, ref) {
    return <Button {...props} ref={ref} size={size === 'sm' ? 'icon-sm' : 'icon'} aria-label={label} />;
  },
);
