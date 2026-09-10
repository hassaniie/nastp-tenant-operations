import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return <span role="status" className="inline-flex"><Loader2 aria-hidden className={cn('h-4 w-4 animate-spin text-subtle', className)} /><span className="sr-only">{label}</span></span>;
}
