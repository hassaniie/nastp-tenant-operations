import type { ReactNode } from 'react';

export function ListToolbar({ children, actions, summary, onReset }: { children: ReactNode; actions?: ReactNode; summary?: ReactNode; onReset?: () => void }) {
  return <div className="ds-list-toolbar"><div className="ds-list-filters" role="search" aria-label="Filter records">{children}</div><div className="ds-list-summary"><span role="status">{summary}</span><div className="flex items-center gap-3">{onReset && <button type="button" className="text-xs text-primary hover:underline" onClick={onReset}>Reset filters</button>}{actions}</div></div></div>;
}
