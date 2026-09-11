/**
 * Tenant Portal — Demand & Load (§17). Current and maximum demand, the demand
 * trend over the selected range, and the daily load curve.
 */

import { Gauge } from 'lucide-react';
import { useState } from 'react';
import { MetricBand } from '../../../components/layout/metric-band';
import { WorkspaceSection } from '../../../components/layout/workspace-section';
import { StatCard } from '../../../components/patterns/stat-card';
import { TrendChart } from '../../../components/patterns/charts';
import { useSession } from '../../../store/session';
import { useLive } from '../../../data/live';
import { tenantPortalSnapshot } from '../../../data/selectors';
import { RangeControl, sliceReadings, type RangeKey } from '../../energyShared';
import { num } from '../../../lib/utils';

export default function PortalEnergyDemand() {
  const { tenantId } = useSession();
  const [range, setRange] = useState<RangeKey>('last7');
  const snap = useLive((w) => tenantPortalSnapshot(w, tenantId));
  const bundle = useLive((w) => w.readings[tenantId] ?? { hourly: [], daily: [], monthly: [] });
  const { data } = sliceReadings(bundle, range);
  const maxInRange = data.reduce((m, d) => Math.max(m, d.demandKw), 0);

  return (
    <>
      <MetricBand columns={3}>
        <StatCard variant="inline" label="Current Demand" value={num(snap.currentDemandKw, 1)} unit="kW" icon={Gauge} tone="energy" />
        <StatCard variant="inline" label="Max in Range" value={num(maxInRange, 1)} unit="kW" icon={Gauge} tone="warning" />
        <StatCard variant="inline" label="Peak Demand (all time)" value={num(snap.peakDemandKw, 1)} unit="kW" icon={Gauge} tone="critical" caption="Sanctioned load reference" />
      </MetricBand>

      <WorkspaceSection title="Demand over time" description="Maximum demand per interval" actions={<RangeControl value={range} onChange={setRange} />}>
          <TrendChart data={data} series={[{ key: 'demandKw', label: 'Demand (kW)' }]} height={260} unit="kW" valueFormatter={(v) => `${num(v, 1)} kW`} />
      </WorkspaceSection>

      <WorkspaceSection title="Load curve" description="Consumption by hour, last 24 hours">
          <TrendChart data={bundle.hourly} series={[{ key: 'kwh', label: 'Load (kW)' }]} height={220} unit="kW" valueFormatter={(v) => `${num(v, 1)} kW`} />
      </WorkspaceSection>
    </>
  );
}
