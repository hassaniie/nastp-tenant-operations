import { ChevronRight } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: ReactNode;
  to?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav className={cn('ds-breadcrumb min-w-0 text-[12px] text-subtle', className)} aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <Fragment key={index}>
              <li className={cn('min-w-0', current && 'truncate')}>
                {item.to && !current ? (
                  <Link to={item.to} className="transition-colors hover:text-foreground">{item.label}</Link>
                ) : (
                  <span className={cn(current && 'text-muted')} aria-current={current ? 'page' : undefined}>{item.label}</span>
                )}
              </li>
              {!current && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
