import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function WorkspaceSection({ children, title, description, actions, className, inset = true }: { children: ReactNode; title?: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string; inset?: boolean }) {
  return <section className={cn('ds-workspace-section', inset && 'is-inset', className)}>{(title || description || actions) && <header className="ds-workspace-section-header"><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{actions}</header>}<div className="ds-workspace-section-body">{children}</div></section>;
}
