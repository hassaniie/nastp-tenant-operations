import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { memo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { Tone } from '../../lib/meta';
import { IconBox } from '../ui/icon-box';
import { Skeleton } from '../ui/skeleton';
import { Tooltip } from '../ui/tooltip';
import { Sparkline } from './charts';
import { Delta, MetricValue } from './metric-value';

export interface StatCardProps { label: string; value: ReactNode; unit?: string; icon?: LucideIcon; tone?: Tone; delta?: number; deltaSuffix?: string; invertDelta?: boolean; caption?: ReactNode; spark?: number[]; sparkColor?: string; onClick?: () => void; loading?: boolean; tooltip?: ReactNode; className?: string; variant?: 'surface' | 'inline'; to?: string }

export const StatCard = memo(function StatCard({ label, value, unit, icon: Icon, tone = 'neutral', delta, deltaSuffix, invertDelta, caption, spark, sparkColor, onClick, loading, tooltip, className, variant = 'surface', to }: StatCardProps) {
  const hasSpark = Boolean(spark && spark.length > 1);
  if (variant === 'inline') {
    const content = <><span className="ds-metric-label">{label}{(to || onClick) && <ArrowUpRight aria-hidden size={14} />}</span>{loading ? <Skeleton className="my-4 h-9 w-24" /> : <strong className="ds-metric-value">{value}{unit && <small>{unit}</small>}</strong>}{caption && <div className="ds-metric-caption">{caption}</div>}</>;
    return to ? <Link className={cn('ds-metric', className)} to={to}>{content}</Link> : onClick ? <button type="button" className={cn('ds-metric text-left', className)} onClick={onClick}>{content}</button> : <div className={cn('ds-metric', className)}>{content}</div>;
  }
  const body = <div className={cn('group relative flex min-h-[104px] flex-col gap-2 overflow-hidden rounded-[var(--radius-surface)] border border-border bg-surface p-3.5 pb-6 transition-all duration-200', onClick && 'cursor-pointer hover:border-border-strong hover:bg-surface-raised', className)} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); } } : undefined}><div className="flex items-start justify-between gap-2"><p className="text-[11px] font-medium uppercase leading-tight tracking-[0.09em] text-subtle">{label}</p>{Icon && <IconBox icon={Icon} tone={tone} size="sm" />}</div>{loading ? <Skeleton className="h-7 w-24" /> : <MetricValue value={value} unit={unit} />}{(delta !== undefined || caption) && <div className="relative z-10 mt-auto flex items-center gap-2">{delta !== undefined && <Delta value={delta} suffix={deltaSuffix} invert={invertDelta} />}{caption && <span className="truncate text-[12px] text-subtle">{caption}</span>}</div>}{hasSpark && <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-60 transition-opacity group-hover:opacity-90"><Sparkline data={spark!} height={20} color={sparkColor} /></div>}</div>;
  return tooltip ? <Tooltip content={tooltip}>{body}</Tooltip> : body;
});
