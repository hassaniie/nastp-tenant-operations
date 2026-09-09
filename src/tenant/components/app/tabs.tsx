import type { ReactNode } from 'react';
import { Tabs as T, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { cn } from '../../lib/utils';

export { T as Tabs, TabsList, TabsTrigger, TabsContent };

export function TabBar<V extends string>({ tabs, value, onChange, className }: {
  tabs: Array<{ id?: V; value?: V; label: ReactNode; count?: number }>; value: V; onChange: (v: V) => void; className?: string;
}) {
  return (
    <T value={value} onValueChange={(v) => onChange(v as V)} className={cn('w-full', className)}>
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        {tabs.map((t) => {
          const id = (t.id ?? t.value) as V;
          return (
          <TabsTrigger key={id} value={id} className="gap-2">
            {t.label}
            {t.count !== undefined && <span className="text-muted-foreground tabular-nums">{t.count}</span>}
          </TabsTrigger>
          );
        })}
      </TabsList>
    </T>
  );
}

export function Segmented<V extends string>({ options, value, onChange, className, size }: {
  options: Array<{ value: V; label: ReactNode; icon?: ReactNode }>; value: V; onChange: (v: V) => void; className?: string; size?: 'sm' | 'md';
}) {
  return (
    <T value={value} onValueChange={(v) => onChange(v as V)} className={cn('w-fit', className)}>
      <TabsList className={cn(size === 'sm' && 'h-8')}>
        {options.map((o) => <TabsTrigger key={o.value} value={o.value}>{o.icon}{o.label}</TabsTrigger>)}
      </TabsList>
    </T>
  );
}

export function FilterChips<V extends string>({ options, value, onChange, className }: {
  options: Array<{ value: V; label: ReactNode; icon?: ReactNode }>; value: V; onChange: (v: V) => void; className?: string;
}) {
  return <Segmented options={options} value={value} onChange={onChange} className={className} />;
}
