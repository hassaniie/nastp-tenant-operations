import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Tone } from '../../lib/meta';
import { TONE_ICON_BOX } from './tone';

export function IconBox({ icon: Icon, tone = 'neutral', size = 'md', className }: { icon: LucideIcon; tone?: Tone; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dimensions = { sm: 'h-7 w-7 rounded-lg', md: 'h-9 w-9 rounded-[11px]', lg: 'h-11 w-11 rounded-xl' };
  const icons = { sm: 'h-3.5 w-3.5', md: 'h-4.5 w-4.5', lg: 'h-5 w-5' };
  return <span className={cn('flex shrink-0 items-center justify-center', dimensions[size], TONE_ICON_BOX[tone], className)}><Icon className={icons[size]} /></span>;
}
