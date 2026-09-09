/**
 * NASTP application primitives, rebuilt on the shadcn preset (b1Na5PBz1s).
 *
 * `components/ui` is now pure preset source — untouched registry files. This
 * module is the thin application layer over it: it keeps the export names and
 * prop shapes the 49 screens already call with, and renders them through the
 * preset's components, so the whole product picks up Rhea's controls,
 * typography and states without every call site being rewritten.
 *
 * Nothing here reproduces the old visual language. Where the old API carried a
 * NASTP concept the preset has no word for — the three module tones, tenant
 * lifecycle states, connectivity — that concept is mapped onto preset
 * variants plus the small token extension in styles/theme.css.
 */

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { Button as UIButton } from '../ui/button';
import { Badge as UIBadge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator as UISeparator } from '../ui/separator';
import { Skeleton as UISkeleton } from '../ui/skeleton';
import { Kbd as UIKbd } from '../ui/kbd';
import { cn } from '../../lib/utils';
import type { Tone } from '../../lib/meta';

/* -------------------------------------------------------------- Button */

/** The old vocabulary mapped onto the preset's. `primary` is the preset's
 *  default fill, `danger` its destructive, `subtle` its ghost. */
const VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'> = {
  primary: 'default', secondary: 'secondary', ghost: 'ghost', outline: 'outline',
  danger: 'destructive', success: 'default', subtle: 'ghost',
};
const SIZE: Record<string, 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'> = {
  xs: 'xs', sm: 'sm', md: 'default', lg: 'lg', icon: 'icon', 'icon-sm': 'icon-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, children, disabled, className, ...props }, ref) => (
    <UIButton
      ref={ref}
      variant={VARIANT[variant] ?? 'secondary'}
      size={SIZE[size] ?? 'default'}
      disabled={disabled || loading}
      className={cn(variant === 'success' && 'bg-success text-white hover:bg-success/90', className)}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </UIButton>
  ),
);
Button.displayName = 'Button';

/* ------------------------------------------------------------- tone map */

/** Domain tones the preset has no variant for resolve to a token colour from
 *  the NASTP extension layer; the rest use the preset's own badge variants. */
const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-muted-foreground', primary: 'text-primary', success: 'text-success',
  warning: 'text-warning', critical: 'text-destructive', info: 'text-info',
  energy: 'text-module-energy', visitor: 'text-module-visitor', service: 'text-module-service',
  online: 'text-success', offline: 'text-muted-foreground',
};
const TONE_BG: Record<Tone, string> = {
  neutral: 'bg-muted-foreground', primary: 'bg-primary', success: 'bg-success',
  warning: 'bg-warning', critical: 'bg-destructive', info: 'bg-info',
  energy: 'bg-module-energy', visitor: 'bg-module-visitor', service: 'bg-module-service',
  online: 'bg-success', offline: 'bg-muted-foreground',
};
export const TONE_DOT = TONE_BG;
export const TONE_CHIP = TONE_TEXT;
export const TONE_ICON_BOX = TONE_TEXT;

/* --------------------------------------------------------- StatusBadge */

export function StatusBadge({
  tone = 'neutral', children, dot = true, pulse, size, className,
}: {
  tone?: Tone; children: ReactNode; dot?: boolean; pulse?: boolean;
  size?: 'sm' | 'md'; className?: string;
}) {
  return (
    <UIBadge variant="outline" className={cn('gap-1.5 font-medium', size === 'sm' && 'px-1.5 py-0 text-xs', className)}>
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && <span className={cn('absolute inline-flex size-full rounded-full opacity-70 animate-ping', TONE_BG[tone])} />}
          <span className={cn('relative inline-flex size-1.5 rounded-full', TONE_BG[tone])} />
        </span>
      )}
      <span className={TONE_TEXT[tone]}>{children}</span>
    </UIBadge>
  );
}

export function Badge({ tone = 'neutral', className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; size?: 'sm' | 'md' }) {
  return <UIBadge variant="secondary" className={cn(TONE_TEXT[tone], className)} {...props}>{children}</UIBadge>;
}

/* --------------------------------------------------------------- misc */

export function IconBox({ icon: Icon, tone = 'neutral', size = 'md', className }: { icon: LucideIcon; tone?: Tone; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dims = { sm: 'size-7 [&>svg]:size-3.5', md: 'size-9 [&>svg]:size-4', lg: 'size-11 [&>svg]:size-5' };
  return (
    <span className={cn('bg-muted flex shrink-0 items-center justify-center rounded-md', dims[size], TONE_TEXT[tone], className)}>
      <Icon />
    </span>
  );
}

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <UIKbd className={className}>{children}</UIKbd>;
}

export function Skeleton({ className }: { className?: string }) {
  return <UISkeleton className={className} />;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('text-muted-foreground size-4 animate-spin', className)} />;
}

export function ProgressBar({ value, max = 100, tone = 'primary', className, showValue, label, height }: {
  value: number; max?: number; tone?: Tone; className?: string; showValue?: boolean; label?: ReactNode; height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-2 text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="tabular-nums font-medium">{Math.round(pct)}%</span>}
        </div>
      )}
      <Progress value={pct} style={height ? { height } : undefined} className={cn('h-1.5', tone !== 'primary' && '[&>[data-slot=progress-indicator]]:' + TONE_BG[tone])} />
    </div>
  );
}

export function Avatar({ name, seed = 1, size = 34, className }: { name: string; seed?: number; size?: number; className?: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const hue = (seed * 47) % 360;
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white', className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `oklch(0.55 0.13 ${hue})` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function TenantMark({ name, hue, size = 40, className }: { name: string; hue: number; size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-md font-semibold text-white', className)}
      style={{ width: size, height: size, fontSize: size * 0.32, background: `oklch(0.55 0.14 ${hue})` }}
      aria-hidden
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function Separator({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical'; className?: string }) {
  return <UISeparator orientation={orientation} className={className} />;
}

export { UIButton as PresetButton };
