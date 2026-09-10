import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import type { Tone } from '../../lib/meta';
import { TONE_DOT } from './tone';

const STATUS_TEXT: Record<Tone, string> = {
  neutral: 'text-subtle', primary: 'text-primary', success: 'text-success', warning: 'text-warning', critical: 'text-critical',
  info: 'text-info', energy: 'text-energy', visitor: 'text-visitor', service: 'text-service', online: 'text-online', offline: 'text-offline',
};

export function StatusBadge({ tone = 'neutral', children, dot = true, pulse: _pulse, size = 'md', className }: {
  tone?: Tone; children: ReactNode; dot?: boolean; pulse?: boolean; size?: 'sm' | 'md'; className?: string;
}) {
  return <span className={cn('ds-status inline-flex items-center gap-1.5 whitespace-nowrap font-medium', size === 'sm' ? 'text-[12px]' : 'text-[13px]', STATUS_TEXT[tone], className)}>
    {dot && <span className="relative flex h-1.5 w-1.5"><span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', TONE_DOT[tone])} /></span>}
    {children}
  </span>;
}
