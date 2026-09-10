import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn, num } from '../../lib/utils';

export function Delta({ value, suffix = '', invert, className, showZero }: { value: number; suffix?: string; invert?: boolean; className?: string; showZero?: boolean }) {
  if (value === 0 && !showZero) return null;
  const positive = value > 0;
  const good = invert ? !positive : positive;
  const Icon = value === 0 ? ArrowRight : positive ? ArrowUpRight : ArrowDownRight;
  return <span className={cn('tnum inline-flex items-center gap-0.5 text-[12px] font-medium', value === 0 ? 'text-subtle' : good ? 'text-success' : 'text-critical', className)}><Icon className="h-3 w-3" />{value > 0 ? '+' : ''}{num(value, Number.isInteger(value) ? 0 : 1)}{suffix}</span>;
}

export function AnimatedNumber({ value, digits = 0, className, duration = 520 }: { value: number; digits?: number; className?: string; duration?: number }) {
  const [display, setDisplay] = useState(value); const from = useRef(value); const raf = useRef<number>();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplay(value); from.current = value; return; }
    const start = performance.now(); const origin = from.current; const delta = value - origin;
    if (delta === 0) return;
    const step = (now: number) => { const time = Math.min(1, (now - start) / duration); const eased = 1 - (1 - time) ** 3; setDisplay(origin + delta * eased); if (time < 1) raf.current = requestAnimationFrame(step); else from.current = value; };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); from.current = value; };
  }, [value, duration]);
  return <span className={cn('tnum', className)}>{num(display, digits)}</span>;
}

export function MetricValue({ value, unit, size = 'md', className }: { value: ReactNode; unit?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizes = { sm: 'text-[18px]', md: 'text-[24px]', lg: 'text-[30px]', xl: 'text-[40px]' };
  const unitSizes = { sm: 'text-[11px]', md: 'text-[12px]', lg: 'text-[13px]', xl: 'text-[15px]' };
  return <span className={cn('inline-flex items-baseline gap-1', className)}><span className={cn('tnum font-semibold leading-none tracking-[-0.03em] text-foreground', sizes[size])}>{value}</span>{unit && <span className={cn('font-medium text-subtle', unitSizes[size])}>{unit}</span>}</span>;
}
