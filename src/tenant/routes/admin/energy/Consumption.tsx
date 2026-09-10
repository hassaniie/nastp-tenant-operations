/**
 * Admin — Tenant Consumption (§13). Compare consumption across tenants: a
 * ranking, a multi-tenant trend comparison, and a sortable table.
 */

import { useNavigate } from 'react-router-dom';
import { Page, WorkspaceSection, WorkspaceSplit } from '../../../components/ui/page';
import { PageHeader } from '../../../components/common';
import { BarSeriesChart, MultiLineChart } from '../../../components/charts';
import { DataTable, type Column } from '../../../components/ui/data';
import { AlertLevelBadge } from '../../../components/status';
import { useLive } from '../../../data/live';
import { alertLevelForTenant, tenantSummary } from '../../../data/selectors';
import { currency, num } from '../../../lib/utils';
import type { TenantSummary } from '../../../data/types';

export default function TenantConsumption() {
  const navigate = useNavigate();
  const ranking = useLive((w) => w.tenants.filter((t) => t.status === 'active').map((t) => ({ summary: tenantSummary(w, t.id), level: alertLevelForTenant(w, t.id) })).sort((a, b) => b.summary.periodKwh - a.summary.periodKwh));
  const comparison = useLive((w) => {
    const top = [...w.tenants].filter((t) => t.status === 'active').map((t) => tenantSummary(w, t.id)).sort((a, b) => b.periodKwh - a.periodKwh).slice(0, 5);
    const first = w.readings[top[0]?.tenant.id]?.daily ?? [];
    return first.map((base, i) => {
      const row: Record<string, string | number> = { label: base.label };
      for (const t of top) row[t.tenant.code] = w.readings[t.tenant.id]?.daily?.[i]?.kwh ?? 0;
      return row;
    });
  });
  const topCodes = ranking.slice(0, 5).map((r) => r.summary.tenant.code);

  const columns: Column<{ summary: TenantSummary; level: import('../../../data/types').AlertLevel }>[] = [
    { key: 'tenant', header: 'Tenant', cell: (r) => <span className="font-medium text-foreground">{r.summary.tenant.name}</span>, sortValue: (r) => r.summary.tenant.name },
    { key: 'building', header: 'Building', cell: (r) => r.summary.buildingName, hideBelow: 'md' },
    { key: 'load', header: 'Load', align: 'right', cell: (r) => <span className="tnum">{num(r.summary.currentLoadKw, 1)} kW</span>, sortValue: (r) => r.summary.currentLoadKw },
    { key: 'kwh', header: 'Period kWh', align: 'right', cell: (r) => <span className="tnum font-medium text-foreground">{num(r.summary.periodKwh)}</span>, sortValue: (r) => r.summary.periodKwh },
    { key: 'charges', header: 'Charges', align: 'right', cell: (r) => <span className="tnum">{currency(r.summary.periodCharges, { compact: true })}</span>, sortValue: (r) => r.summary.periodCharges, hideBelow: 'lg' },
    { key: 'level', header: 'Energy', cell: (r) => <AlertLevelBadge level={r.level} size="sm" /> },
  ];

  return (
    <Page workspace archetype="analytics" className="ds-data-workspace">
      <PageHeader eyebrow="Energy intelligence · Tenant comparison" title="Tenant consumption" description="Compare energy consumption across every active tenant." />
      <WorkspaceSplit ratio="balanced">
        <WorkspaceSection title="Consumption ranking" description="By billing-period consumption">
            <BarSeriesChart data={ranking.slice(0, 10).map((r) => ({ label: r.summary.tenant.code, kwh: r.summary.periodKwh }))} series={[{ key: 'kwh', label: 'kWh' }]} horizontal height={300} valueFormatter={(v) => `${num(v)} kWh`} />
        </WorkspaceSection>
        <WorkspaceSection title="Trend comparison" description="Top 5 tenants · Last 30 days">
            <MultiLineChart data={comparison} series={topCodes.map((c) => ({ key: c, label: c }))} height={300} unit="kWh" valueFormatter={(v) => `${num(v)} kWh`} />
        </WorkspaceSection>
      </WorkspaceSplit>
      <WorkspaceSection title="All tenants" description={`${ranking.length} active`} inset={false} className="border-b-0">
        <DataTable rows={ranking} columns={columns} rowKey={(r) => r.summary.tenant.id} rowLabel={(r) => r.summary.tenant.name} label="Tenant energy consumption" onRowClick={(r) => navigate(`/admin/tenants/${r.summary.tenant.id}`)} pageSize={12} />
      </WorkspaceSection>
    </Page>
  );
}
