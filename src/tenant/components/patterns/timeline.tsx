import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import type { Tone } from '../../lib/meta';
import { TONE_DOT } from '../ui/tone';

export interface TimelineItem { id: string; icon?: LucideIcon; tone?: Tone; title: ReactNode; detail?: ReactNode; meta?: ReactNode }
const TONE_ICON: Record<Tone, string> = { neutral: 'text-muted', primary: 'text-primary', success: 'text-success', warning: 'text-warning', critical: 'text-critical', info: 'text-info', energy: 'text-energy', visitor: 'text-visitor', service: 'text-service', online: 'text-online', offline: 'text-muted' };
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return <ol className={cn('flex flex-col', className)}>{items.map((item, index) => { const Icon = item.icon; const last = index === items.length - 1; return <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">{!last && <span className="absolute bottom-0 left-[13px] top-7 w-px bg-border" aria-hidden />}<span className={cn('relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-border bg-surface', item.tone && TONE_ICON[item.tone])}>{Icon ? <Icon className="h-3.5 w-3.5" /> : <span className={cn('h-1.5 w-1.5 rounded-full', item.tone ? TONE_DOT[item.tone] : 'bg-subtle')} />}</span><div className="min-w-0 flex-1 pt-0.5"><div className="flex items-start justify-between gap-2"><p className="text-[13px] font-medium text-foreground">{item.title}</p>{item.meta && <span className="shrink-0 text-[11px] text-subtle">{item.meta}</span>}</div>{item.detail && <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{item.detail}</p>}</div></li>; })}</ol>;
}
