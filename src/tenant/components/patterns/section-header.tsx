import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function SectionHeader({ title, description, actions, children, className, compact }: {
  title: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode; className?: string; compact?: boolean;
}) {
  return <div className={cn('ds-section-header', compact && 'is-compact', className)}><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{(actions || children) && <div className="flex items-center gap-2">{actions || children}</div>}</div>;
}
