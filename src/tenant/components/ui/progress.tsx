import { cn } from '../../lib/utils';
import type { Tone } from '../../lib/meta';
import { TONE_DOT } from './tone';

export function ProgressBar({ value, tone = 'primary', className, height = 7, segments }: {
  value: number; tone?: Tone; className?: string; height?: number; segments?: Array<{ value: number; tone: Tone; label?: string }>;
}) {
  const parts = segments ?? [{ value, tone }];
  return <div className={cn('flex w-full overflow-hidden rounded-full bg-surface-inset', className)} style={{ height }} role="progressbar" aria-label="Progress" aria-valuenow={Math.round(Math.max(0, Math.min(100, value)))} aria-valuemin={0} aria-valuemax={100}>
    {parts.map((part, index) => <div key={index} title={part.label} className={cn('h-full transition-[width] duration-500 ease-out', TONE_DOT[part.tone])} style={{ width: `${Math.max(0, Math.min(100, part.value))}%` }} />)}
  </div>;
}
