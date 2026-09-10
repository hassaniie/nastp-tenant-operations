/** Admin energy analytics workspace. Existing live selectors and destinations are preserved. */
import { ArrowUpRight, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricBand, Page, WorkspaceSection, WorkspaceSplit } from '../../../components/ui/page';
import { PageHeader, StatCard } from '../../../components/common';
import { Button } from '../../../components/ui/primitives';
import { MeterStatusBadge } from '../../../components/status';
import { TrendChart, BarSeriesChart, DonutChart } from '../../../components/charts';
import { useLive } from '../../../data/live';
import { computeAdminKpis, aggregateReadings, tenantSummary } from '../../../data/selectors';
import { currency, energy, num } from '../../../lib/utils';

export default function EnergyOverview() {
  const navigate = useNavigate();
  const kpis = useLive(computeAdminKpis);
  const daily = useLive((w) => aggregateReadings(w, 'daily'));
  const monthly = useLive((w) => aggregateReadings(w, 'monthly'));
  const ranking = useLive((w) => w.tenants.filter((t) => t.status === 'active').map((t) => tenantSummary(w, t.id)).sort((a, b) => b.periodKwh - a.periodKwh).slice(0, 8));
  const offlineMeters = useLive((w) => w.meters.filter((m) => m.status === 'offline'));
  const monthPeak = monthly.reduce((sum, item) => sum + item.peakKwh, 0);
  const monthOff = monthly.reduce((sum, item) => sum + item.offPeakKwh, 0);

  return <Page workspace archetype="analytics">
    <PageHeader eyebrow="Energy intelligence · Park operations" title="Energy overview" description="Consumption, demand and charges across the NASTP park." actions={<Button variant="secondary" size="sm" onClick={() => navigate('/admin/energy/meters')}><Gauge />Meters</Button>} />
    <MetricBand columns={4}>
      <StatCard variant="inline" label="Month consumption" value={energy(kpis.totalConsumptionKwh).value} unit={energy(kpis.totalConsumptionKwh).unit} caption="All active tenants" />
      <StatCard variant="inline" label="Current load" value={energy(kpis.currentLoadKw, 'kW').value} unit="kW" caption="Live park demand" />
      <StatCard variant="inline" label="Peak demand" value={num(kpis.peakDemandKw)} unit="kW" caption="Current billing period" />
      <StatCard variant="inline" label="Month charges" value={currency(kpis.totalChargesMonth, { compact: true })} caption="Across all tenants" onClick={() => navigate('/admin/energy/billing')} />
    </MetricBand>
    <MetricBand columns={4} className="ds-compact-metrics border-t-0">
      <StatCard variant="inline" label="Active meters" value={num(kpis.metersTotal - kpis.offlineMeters)} caption={`${kpis.metersTotal} total`} />
      <StatCard variant="inline" label="Offline meters" value={num(kpis.offlineMeters)} caption={kpis.offlineMeters ? 'Requires attention' : 'Every meter reporting'} onClick={() => navigate('/admin/energy/meters')} />
      <StatCard variant="inline" label="High consumption" value={num(kpis.highConsumptionAlerts)} caption="Active alerts" onClick={() => navigate('/admin/energy/alerts')} />
      <StatCard variant="inline" label="Peak share" value={monthPeak + monthOff ? Math.round((monthPeak / (monthPeak + monthOff)) * 100) : 0} unit="%" caption="Of total consumption" />
    </MetricBand>
    <WorkspaceSplit ratio="balanced">
      <WorkspaceSection title="Consumption trend" description="Park-wide · Last 30 days" actions={<Button variant="ghost" size="xs" onClick={() => navigate('/admin/energy/consumption')}>Explore energy<ArrowUpRight /></Button>}>
        <TrendChart data={daily} series={[{ key: 'kwh', label: 'Consumption (kWh)' }, { key: 'peakKwh', label: 'Peak (kWh)' }]} height={240} unit="kWh" valueFormatter={(value) => `${num(value)} kWh`} />
      </WorkspaceSection>
      <WorkspaceSection title="Peak vs off-peak" description="Last 12 months">
        <DonutChart height={200} centreValue={`${Math.round((monthPeak / (monthPeak + monthOff || 1)) * 100)}%`} centreLabel="peak" data={[{ label: 'Peak', value: Math.round(monthPeak), color: 'var(--viz-2)' }, { label: 'Off-peak', value: Math.round(monthOff), color: 'var(--viz-1)' }]} />
      </WorkspaceSection>
    </WorkspaceSplit>
    <WorkspaceSplit ratio="balanced">
      <WorkspaceSection title="Highest consuming tenants" description="This billing period" actions={<Button variant="ghost" size="xs" onClick={() => navigate('/admin/energy/consumption')}>Details<ArrowUpRight /></Button>}>
        <BarSeriesChart data={ranking.map((item) => ({ label: item.tenant.code, kwh: item.periodKwh }))} series={[{ key: 'kwh', label: 'kWh' }]} horizontal height={260} valueFormatter={(value) => `${num(value)} kWh`} />
      </WorkspaceSection>
      <WorkspaceSection title="Offline meters" description={`${offlineMeters.length} not reporting`}>
        <div className="ds-flat-list">{offlineMeters.length === 0 ? <p className="py-6 text-center text-[13px] text-subtle">Every meter is reporting.</p> : offlineMeters.map((meter) => <button key={meter.id} onClick={() => navigate('/admin/energy/meters')} className="flex w-full items-center justify-between gap-3 border-b border-border py-3 text-left transition-colors hover:text-foreground"><span className="min-w-0"><strong className="block truncate text-[13px] font-medium text-foreground">{meter.name}</strong><span className="tnum block truncate text-[11px] text-subtle">{meter.serial}</span></span><MeterStatusBadge status={meter.status} size="sm" /></button>)}</div>
      </WorkspaceSection>
    </WorkspaceSplit>
  </Page>;
}
