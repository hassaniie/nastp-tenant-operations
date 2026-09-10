import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function PageHeader({ title, description, actions, breadcrumb, className, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; breadcrumb?: ReactNode; className?: string; eyebrow?: ReactNode }) {
  return <div className={cn('ds-page-header', className)}><div className="min-w-0">{breadcrumb}{eyebrow && <div className="ds-eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="ds-page-actions">{actions}</div>}</div>;
}
