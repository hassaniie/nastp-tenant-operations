/**
 * Tenant Portal — Energy Consumption (§17). Consumption over time with flexible
 * date ranges, a peak/off-peak breakdown, and a table view for accessibility.
 */

import { Zap } from 'lucide-react';
import { useState } from 'react';
import { MetricBand } from '../../../components/layout/metric-band';
import { WorkspaceSection } from '../../../components/layout/workspace-section';
import { StatCard } from '../../../components/patterns/stat-card';
import { TrendChart, BarSeriesChart } from '../../../components/patterns/charts';
import { useSession } from '../../../store/session';
import { useLive } from '../../../data/live';
import { RangeControl, sliceReadings, sumField, type RangeKey } from '../../energyShared';
import { num } from '../../../lib/utils';

export default function PortalEnergyConsumption() {
  const { tenantId } = useSession();
  const [range, setRange] = useState<RangeKey>('last30');
  const bundle = useLive((w) => w.readings[tenantId] ?? { hourly: [], daily: [], monthly: [] });
  const { data, granularity } = sliceReadings(bundle, range);

  const total = sumField(data, 'kwh');
  const peak = sumField(data, 'peakKwh');
  const off = sumField(data, 'offPeakKwh');
  const avg = data.length ? Math.round(total / data.length) : 0;

  return (
    <>
      <MetricBand columns={4}>
        <StatCard variant="inline" label="Total Consumption" value={num(total)} unit="kWh" icon={Zap} tone="energy" />
        <StatCard variant="inline" label="Peak" value={num(peak)} unit="kWh" icon={Zap} tone="warning" caption={`${total ? Math.round((peak / total) * 100) : 0}% of total`} />
        <StatCard variant="inline" label="Off-Peak" value={num(off)} unit="kWh" icon={Zap} tone="primary" caption={`${total ? Math.round((off / total) * 100) : 0}% of total`} />
        <StatCard variant="inline" label={`Average / ${granularity}`} value={num(avg)} unit="kWh" icon={Zap} tone="neutral" />
      </MetricBand>

      <WorkspaceSection title="Consumption breakdown" description={`Peak and off-peak · ${granularity} granularity`} actions={<RangeControl value={range} onChange={setRange} />}>
          <TrendChart data={data} series={[{ key: 'peakKwh', label: 'Peak (kWh)', color: 'var(--viz-2)' }, { key: 'offPeakKwh', label: 'Off-peak (kWh)', color: 'var(--viz-1)' }]} stacked height={260} unit="kWh" valueFormatter={(v) => `${num(v)} kWh`} />
      </WorkspaceSection>

      <WorkspaceSection title="Usage per interval" description="Total consumption">
          <BarSeriesChart data={data} series={[{ key: 'kwh', label: 'kWh' }]} height={220} valueFormatter={(v) => `${num(v)} kWh`} />
      </WorkspaceSection>
    </>
  );
}
