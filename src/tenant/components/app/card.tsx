/**
 * Panel surface — the preset's Card, with the header shape the screens use.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Card as UICard, CardContent, CardHeader as UICardHeader, CardTitle, CardDescription, CardAction } from '../ui/card';
import { cn } from '../../lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { interactive?: boolean; glass?: boolean }>(
  ({ className, interactive, glass: _glass, ...props }, ref) => (
    <UICard ref={ref} className={cn('min-w-0 gap-0 py-0', interactive && 'hover:border-ring/40 cursor-pointer transition-colors', className)} {...props} />
  ),
);
Card.displayName = 'Card';

export function CardHeader({ title, subtitle, icon, actions, className, compact }: {
  title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; actions?: ReactNode; className?: string; compact?: boolean;
}) {
  return (
    <UICardHeader className={cn('min-w-0 border-b [&>*]:min-w-0', compact ? 'py-3' : 'py-4', className)}>
      <CardTitle className="flex items-center gap-2 text-[15px]">{icon}{title}</CardTitle>
      {subtitle && <CardDescription>{subtitle}</CardDescription>}
      {actions && <CardAction>{actions}</CardAction>}
    </UICardHeader>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <CardContent className={cn('py-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-t px-6 py-3', className)} {...props} />;
}

export function SectionHeader({ title, description, actions, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-end justify-between gap-3 pb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
