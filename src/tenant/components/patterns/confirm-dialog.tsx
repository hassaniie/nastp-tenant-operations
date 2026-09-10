import { useRef, useState, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog';

export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive, onConfirm }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: ReactNode;
  confirmLabel?: string; cancelLabel?: string; destructive?: boolean; onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const cancel = useRef<HTMLButtonElement>(null);
  const changeOpen = (value: boolean) => { if (busy) return; setError(undefined); onOpenChange(value); };
  const confirm = async () => { setBusy(true); setError(undefined); try { await onConfirm(); onOpenChange(false); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not complete this action. Please try again.'); } finally { setBusy(false); } };
  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent size="sm" onOpenAutoFocus={(event) => { event.preventDefault(); cancel.current?.focus(); }} onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}><DialogHeader title={title} description={description} />{error && <DialogBody><p role="alert" className="text-sm text-critical">{error}</p></DialogBody>}<DialogFooter><Button ref={cancel} disabled={busy} variant="ghost" onClick={() => changeOpen(false)}>{cancelLabel}</Button><Button variant={destructive ? 'danger' : 'primary'} loading={busy} onClick={confirm}>{confirmLabel}</Button></DialogFooter></DialogContent></Dialog>;
}
