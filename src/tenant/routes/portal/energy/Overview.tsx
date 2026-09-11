/**
 * Tenant Portal — Energy Overview (§17). Answers the tenant's core questions:
 * current consumption, load and demand; period usage and charges; how it
 * compares. Date ranges drive the charts. No raw electrical metrics here —
 * those live under Energy Details.
 */

import { Bell, Gauge, TrendingUp, Wallet, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricBand } from '../../../components/layout/metric-band';
import { WorkspaceSection } from '../../../components/layout/workspace-section';
import { WorkspaceSplit } from '../../../components/layout/workspace-split';
import { StatCard } from '../../../components/patterns/stat-card';
import { TrendChart, DonutChart } from '../../../components/patterns/charts';
import { useSession } from '../../../store/session';
import { useLive } from '../../../data/live';
import { tenantPortalSnapshot } from '../../../data/selectors';
import { RangeControl, sliceReadings, sumField, type RangeKey } from '../../energyShared';
import { currency, energy, num } from '../../../lib/utils';

export default function PortalEnergyOverview() {
  const { tenantId } = useSession();
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeKey>('last30');
  const snap = useLive((w) => tenantPortalSnapshot(w, tenantId));
  const bundle = useLive((w) => w.readings[tenantId] ?? { hourly: [], daily: [], monthly: [] });
  const { data } = sliceReadings(bundle, range);

  const peak = sumField(data, 'peakKwh');
  const off = sumField(data, 'offPeakKwh');

  return (
    <>
      <MetricBand columns={4}>
        <StatCard variant="inline" label="Current Load" value={energy(snap.currentLoadKw, 'kW').value} unit={energy(snap.currentLoadKw, 'kW').unit} icon={Zap} tone="energy" />
        <StatCard variant="inline" label="Current Demand" value={num(snap.currentDemandKw, 1)} unit="kW" icon={Gauge} tone="energy" caption={`Peak ${num(snap.peakDemandKw)} kW`} />
        <StatCard variant="inline" label="Period Usage" value={energy(snap.periodKwh).value} unit={energy(snap.periodKwh).unit} icon={TrendingUp} tone="primary" caption="This billing period" />
        <StatCard variant="inline" label="Period Charges" value={currency(snap.periodCharges, { compact: true })} icon={Wallet} tone="primary" onClick={() => navigate('/portal/energy/billing')} />
      </MetricBand>

      <WorkspaceSplit ratio="balanced">
        <WorkspaceSection title="Consumption over time" description="Your metered usage" actions={<RangeControl value={range} onChange={setRange} />}>
            <TrendChart data={data} series={[{ key: 'kwh', label: 'Consumption (kWh)' }]} height={240} unit="kWh" valueFormatter={(v) => `${num(v)} kWh`} />
        </WorkspaceSection>
        <WorkspaceSection title="Peak vs Off-Peak" description="For the selected range">
              <DonutChart height={180} centreValue={`${peak + off ? Math.round((peak / (peak + off)) * 100) : 0}%`} centreLabel="peak" data={[{ label: 'Peak', value: peak, color: 'var(--viz-2)' }, { label: 'Off-peak', value: off, color: 'var(--viz-1)' }]} />
          <div className="mt-5 grid grid-cols-2 border-t border-border">
            <StatCard variant="inline" label="Active Meters" value={`${snap.activeMeters}/${snap.totalMeters}`} icon={Gauge} tone={snap.activeMeters < snap.totalMeters ? 'warning' : 'success'} />
            <StatCard variant="inline" label="Alerts" value={num(snap.activeAlerts)} icon={Bell} tone={snap.activeAlerts ? 'warning' : 'success'} onClick={() => navigate('/portal/energy/alerts')} />
          </div>
        </WorkspaceSection>
      </WorkspaceSplit>

      <WorkspaceSection title="Demand over time" description="Maximum demand per interval">
          <TrendChart data={data} series={[{ key: 'demandKw', label: 'Demand (kW)' }]} height={200} unit="kW" fill={false} valueFormatter={(v) => `${num(v, 1)} kW`} />
      </WorkspaceSection>
    </>
  );
}
