import { Accessibility, Boxes, Brush, Building2, Car, Cctv, Fan, Flame, KeyRound, Lightbulb, MoveVertical, Plug, ShieldCheck, UserRound, Wifi, Wrench, Zap, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AlertLevel, AlertSeverity, MeterStatus, NotificationDomain, PaymentStatus, ServiceCategory, ServicePriority, ServiceStatus, TenantStatus, VisitorStatus } from '../../data/types';
import { ALERT_LEVEL, ALERT_SEVERITY, METER_STATUS, PAYMENT_STATUS, SERVICE_PRIORITY, SERVICE_STATUS, TENANT_STATUS, VISITOR_STATUS, type Tone } from '../../lib/meta';
import { cn } from '../../lib/utils';
import { TONE_DOT } from '../ui/tone';

const STATUS_TEXT: Record<Tone, string> = { neutral: 'text-subtle', primary: 'text-primary', success: 'text-success', warning: 'text-warning', critical: 'text-critical', info: 'text-info', energy: 'text-energy', visitor: 'text-visitor', service: 'text-service', online: 'text-online', offline: 'text-offline' };
export function StatusBadge({ tone = 'neutral', children, dot = true, pulse: _pulse, size = 'md', className }: { tone?: Tone; children: ReactNode; dot?: boolean; pulse?: boolean; size?: 'sm' | 'md'; className?: string }) {
  return <span className={cn('ds-status inline-flex items-center gap-1.5 whitespace-nowrap font-medium', size === 'sm' ? 'text-[12px]' : 'text-[13px]', STATUS_TEXT[tone], className)}>{dot && <span className="relative flex h-1.5 w-1.5"><span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', TONE_DOT[tone])} /></span>}{children}</span>;
}
export function TenantStatusBadge({ status, size, pulse }: { status: TenantStatus; size?: 'sm' | 'md'; pulse?: boolean }) { const meta = TENANT_STATUS[status]; return <StatusBadge tone={meta.tone} size={size} pulse={pulse ?? status === 'suspended'}>{meta.label}</StatusBadge>; }
export function ServiceStatusBadge({ status, size }: { status: ServiceStatus; size?: 'sm' | 'md' }) { const meta = SERVICE_STATUS[status]; return <StatusBadge tone={meta.tone} size={size}>{meta.label}</StatusBadge>; }
export function PriorityBadge({ priority, size }: { priority: ServicePriority; size?: 'sm' | 'md' }) { const meta = SERVICE_PRIORITY[priority]; return <StatusBadge tone={meta.tone} size={size} pulse={priority === 'critical'}>{meta.label}</StatusBadge>; }
export function VisitorStatusBadge({ status, size }: { status: VisitorStatus; size?: 'sm' | 'md' }) { const meta = VISITOR_STATUS[status]; return <StatusBadge tone={meta.tone} size={size} pulse={status === 'overstaying'}>{meta.label}</StatusBadge>; }
export function AlertSeverityBadge({ severity, size }: { severity: AlertSeverity; size?: 'sm' | 'md' }) { const meta = ALERT_SEVERITY[severity]; return <StatusBadge tone={meta.tone} size={size} pulse={severity === 'critical'}>{meta.label}</StatusBadge>; }
export function AlertLevelBadge({ level, size }: { level: AlertLevel; size?: 'sm' | 'md' }) { const meta = ALERT_LEVEL[level]; return <StatusBadge tone={meta.tone} size={size} dot pulse={level === 'critical' || level === 'offline'}>{meta.label}</StatusBadge>; }
export function PaymentBadge({ status, size }: { status: PaymentStatus; size?: 'sm' | 'md' }) { const meta = PAYMENT_STATUS[status]; return <StatusBadge tone={meta.tone} size={size} pulse={status === 'overdue'}>{meta.label}</StatusBadge>; }
export function MeterStatusBadge({ status, size }: { status: MeterStatus; size?: 'sm' | 'md' }) { const meta = METER_STATUS[status]; return <StatusBadge tone={meta.tone} size={size} pulse={status === 'offline'}>{meta.label}</StatusBadge>; }

export const MODULE_ICON: Record<NotificationDomain, LucideIcon> = { energy: Zap, visitor: UserRound, service: Wrench, tenant: Building2, system: Boxes };
export const MODULE_TONE: Record<NotificationDomain, Tone> = { energy: 'energy', visitor: 'visitor', service: 'service', tenant: 'primary', system: 'neutral' };
export const CATEGORY_ICON: Record<ServiceCategory, LucideIcon> = { electrical: Plug, hvac: Fan, lighting: Lightbulb, plumbing: Wrench, internet: Wifi, cleaning: Brush, security: ShieldCheck, access_control: KeyRound, elevator: MoveVertical, fire_safety: Flame, parking: Car, building_maintenance: Building2, other: Boxes };
export { Cctv, Accessibility };
