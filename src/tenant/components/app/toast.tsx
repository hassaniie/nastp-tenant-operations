/** Toast surface — preset Card styling, driven by the existing session store. */
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { useSession } from '../../store/session';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const ICON = { default: Info, success: CheckCircle2, warning: TriangleAlert, critical: XCircle, info: Info };
const TONE = { default: 'text-muted-foreground', success: 'text-success', warning: 'text-warning', critical: 'text-destructive', info: 'text-info' };

export function Toaster() {
  const { toasts, dismissToast } = useSession();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICON[t.variant] ?? Info;
        return (
          <div key={t.id} className="bg-popover text-popover-foreground pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg">
            <Icon className={cn('mt-0.5 size-4 shrink-0', TONE[t.variant])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-muted-foreground mt-0.5 text-sm">{t.description}</p>}
              {t.action && <Button variant="link" size="xs" className="mt-1 px-0" onClick={t.action.onClick}>{t.action.label}</Button>}
            </div>
            <Button variant="ghost" size="icon-xs" onClick={() => dismissToast(t.id)} aria-label="Dismiss"><X /></Button>
          </div>
        );
      })}
    </div>
  );
}
