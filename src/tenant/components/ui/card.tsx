import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * The surface every panel is built from. Bordered surfaces have no elevation; overlays alone cast shadows.
 */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { interactive?: boolean; glass?: boolean }>(
  ({ className, interactive, glass, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex flex-col rounded-[var(--radius-surface)] border border-border bg-surface',
        glass && 'glass',
        interactive && 'cursor-pointer transition-all duration-200 hover:border-border-strong',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export function CardHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
  compact,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b border-border-subtle', compact ? 'px-3.5 py-2.5' : 'px-4 py-3.5', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 truncate text-[12px] text-subtle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 p-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3', className)} {...props} />;
}
