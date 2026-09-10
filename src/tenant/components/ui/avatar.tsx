import { cn } from '../../lib/utils';

export function Avatar({ name, seed = 1, size = 34, className }: { name: string; seed?: number; size?: number; className?: string }) {
  void seed;
  const letters = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised font-medium text-subtle', className)} style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden>{letters}</span>;
}

export function TenantMark({ name, hue, size = 40, className }: { name: string; hue: number; size?: number; className?: string }) {
  const letters = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return <span className={cn('inline-flex shrink-0 items-center justify-center rounded-md border border-border font-medium', className)} style={{ width: size, height: size, fontSize: size * 0.36, background: `hsl(${hue} 20% 88%)`, color: `hsl(${hue} 25% 25%)` }} aria-hidden>{letters}</span>;
}
