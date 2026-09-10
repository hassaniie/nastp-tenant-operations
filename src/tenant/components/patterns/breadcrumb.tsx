import { ChevronRight } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Breadcrumb({ items, className }: { items: Array<{ label: ReactNode; to?: string }>; className?: string }) {
  return <nav className={cn('flex items-center gap-1.5 text-[12px] text-subtle', className)} aria-label="Breadcrumb">{items.map((item, index) => <Fragment key={index}>{item.to ? <Link to={item.to} className="transition-colors hover:text-foreground">{item.label}</Link> : <span className={cn(index === items.length - 1 && 'text-muted')}>{item.label}</span>}{index < items.length - 1 && <ChevronRight className="h-3 w-3 opacity-60" />}</Fragment>)}</nav>;
}
