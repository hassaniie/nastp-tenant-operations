import type { ReactNode } from 'react';

export function DetailSection({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return <section className="ds-detail-section"><div className="flex items-center justify-between gap-3"><h3>{title}</h3>{actions}</div><div>{children}</div></section>;
}
