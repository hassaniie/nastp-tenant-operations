import type { Tone } from '../../lib/meta';

export const TONE_CHIP: Record<Tone, string> = {
  neutral: 'bg-neutral-dim text-muted border border-border', primary: 'bg-primary-muted text-primary border border-primary/25',
  success: 'bg-success-dim text-success border border-success/25', warning: 'bg-warning-dim text-warning border border-warning/25',
  critical: 'bg-critical-dim text-critical border border-critical/25', info: 'bg-info-dim text-info border border-info/25',
  energy: 'bg-energy-dim text-energy border border-energy/25', visitor: 'bg-visitor-dim text-visitor border border-visitor/25',
  service: 'bg-service-dim text-service border border-service/25', online: 'bg-online-dim text-online border border-online/25',
  offline: 'bg-offline-dim text-muted border border-border',
};

export const TONE_DOT: Record<Tone, string> = {
  neutral: 'bg-neutral', primary: 'bg-primary', success: 'bg-success', warning: 'bg-warning', critical: 'bg-critical',
  info: 'bg-info', energy: 'bg-energy', visitor: 'bg-visitor', service: 'bg-service', online: 'bg-online', offline: 'bg-offline',
};

export const TONE_ICON_BOX: Record<Tone, string> = {
  neutral: 'text-muted bg-surface-raised', primary: 'text-primary bg-primary-muted', success: 'text-success bg-success-dim',
  warning: 'text-warning bg-warning-dim', critical: 'text-critical bg-critical-dim', info: 'text-info bg-info-dim',
  energy: 'text-energy bg-energy-dim', visitor: 'text-visitor bg-visitor-dim', service: 'text-service bg-service-dim',
  online: 'text-online bg-online-dim', offline: 'text-muted bg-offline-dim',
};
