import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function RatingStars({ value, onChange, size = 16, className }: { value: number; onChange?: (value: number) => void; size?: number; className?: string }) {
  const [hover, setHover] = useState(0); const interactive = Boolean(onChange);
  return <div className={cn('inline-flex items-center gap-0.5', className)} role={interactive ? 'group' : undefined} aria-label="Service rating">{[1, 2, 3, 4, 5].map((number) => { const filled = (hover || value) >= number; return <button key={number} type="button" disabled={!interactive} onMouseEnter={interactive ? () => setHover(number) : undefined} onMouseLeave={interactive ? () => setHover(0) : undefined} onClick={interactive ? () => onChange?.(number) : undefined} className={cn(interactive && 'cursor-pointer transition-transform hover:scale-110', !interactive && 'cursor-default')} aria-pressed={interactive ? value === number : undefined} aria-label={`${number} star${number > 1 ? 's' : ''}`}><Star className={cn(filled ? 'fill-warning text-warning' : 'text-border-strong')} style={{ width: size, height: size }} /></button>; })}</div>;
}
