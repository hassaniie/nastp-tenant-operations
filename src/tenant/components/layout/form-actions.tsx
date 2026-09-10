import type { ReactNode } from 'react';

export function FormActions({ children, message }: { children: ReactNode; message?: ReactNode }) {
  return <div className="ds-form-actions">{message && <span role="status" className="mr-auto text-xs text-subtle">{message}</span>}{children}</div>;
}
