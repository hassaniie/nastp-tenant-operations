/**
 * Admin — Energy Alerts (§18). Active and historical alerts with severity,
 * source, tenant and meter, and acknowledge / resolve actions.
 */

import { Bell, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { MetricBand, Page } from '../../../components/ui/page';
import { PageHeader, StatCard } from '../../../components/common';
import { Button } from '../../../components/ui/primitives';
import { Segmented } from '../../../components/ui/tabs';
import { EmptyState } from '../../../components/ui/data';
import { AlertSeverityBadge } from '../../../components/status';
import { ALERT_KIND_LABEL } from '../../../lib/meta';
import { simulation, useLive } from '../../../data/live';
import { ago, num } from '../../../lib/utils';
import type { EnergyAlert } from '../../../data/types';

export default function EnergyAlerts() {
  const [filter, setFilter] = useState<'active' | 'acknowledged' | 'all'>('active');
  const alerts = useLive((w) => w.alerts.map((a) => ({ ...a, tenantName: w.tenantById[a.tenantId]?.name ?? '—' })));

  const shown = alerts.filter((a) => (filter === 'all' ? true : a.status === filter));
  const active = alerts.filter((a) => a.status === 'active').length;
  const critical = alerts.filter((a) => a.status === 'active' && a.severity === 'critical').length;
  const warning = alerts.filter((a) => a.status === 'active' && a.severity === 'warning').length;

  return (
    <Page workspace archetype="operational">
      <PageHeader eyebrow="Energy operations · Live exceptions" title="Energy alerts" description="Threshold, demand, offline and unusual-consumption alerts across tenants." />
      <MetricBand columns={3}>
        <StatCard variant="inline" label="Active" value={num(active)} caption={active ? 'Awaiting action' : 'No active alerts'} />
        <StatCard variant="inline" label="Critical" value={num(critical)} caption={critical ? 'Immediate response' : 'No critical alerts'} />
        <StatCard variant="inline" label="Warning" value={num(warning)} caption={warning ? 'Monitor and triage' : 'No warnings'} />
      </MetricBand>
      <div className="ds-operational-toolbar"><div><h2 className="text-sm font-semibold text-foreground">Alert queue</h2><p className="mt-1 text-xs text-subtle">{shown.length} shown</p></div><Segmented value={filter} onChange={setFilter} options={[{ value: 'active', label: 'Active' }, { value: 'acknowledged', label: 'Acknowledged' }, { value: 'all', label: 'All' }]} size="sm" /></div>
      <div className="ds-flat-list">
          {shown.length === 0 ? (
            <EmptyState title="No alerts here" description={filter === 'active' ? 'Every tenant is within thresholds.' : 'Nothing to show for this filter.'} icon={<Bell className="h-5 w-5" />} />
          ) : (
            shown.map((a) => <AlertRow key={a.id} alert={a} tenantName={a.tenantName} />)
          )}
      </div>
    </Page>
  );
}

function AlertRow({ alert: a, tenantName }: { alert: EnergyAlert; tenantName: string }) {
  return (
    <article className="ds-operational-row">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-medium text-foreground">{a.title}</p>
          <AlertSeverityBadge severity={a.severity} size="sm" />
          <span className="text-[11px] text-subtle">{ALERT_KIND_LABEL[a.kind]}</span>
        </div>
        <p className="mt-0.5 text-[12px] text-muted">{a.description}</p>
        <p className="mt-1 text-[11px] text-subtle">{tenantName} · {a.source}{a.value !== undefined ? ` · value ${num(a.value)} vs threshold ${num(a.threshold ?? 0)}` : ''} · {ago(a.ts)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {a.status === 'active' && (
          <Button variant="ghost" size="xs" onClick={() => simulation.acknowledgeAlert(a.id)}><Check className="h-3.5 w-3.5" />Ack</Button>
        )}
        {a.status !== 'resolved' && (
          <Button variant="secondary" size="xs" onClick={() => simulation.resolveAlert(a.id)}><CheckCheck className="h-3.5 w-3.5" />Resolve</Button>
        )}
      </div>
    </article>
  );
}
