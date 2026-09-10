import { useEffect } from 'react';
/** Browser-exit protection for a dirty form. App dismissals use ConfirmDialog;
 * useDraft retains work across auth/route changes without replacing HashRouter. */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}
