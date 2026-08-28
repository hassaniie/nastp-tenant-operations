/**
 * Admin — Service Performance (§30). Analytics that support decisions: request
 * volume over time, category and priority distribution, resolution time and
 * per-tenant activity.
 */

import { BarChart3, Clock, UserCog, Users, Wrench } from 'lucide-react';
import { Page, StatGrid, ContentGrid, SplitGrid } from '../../../components/ui/page';
import { Card, CardBody, CardHeader } from '../../../components/ui/card';
import { PageHeader, StatCard } from '../../../components/common';
import { IconBox } from '../../../components/ui/primitives';
import { BarSeriesChart, DonutChart } from '../../../components/charts';
import { DataTable, type Column } from '../../../components/ui/data';
import { useLive } from '../../../data/live';
import { NOW } from '../../../data/world';
import { SERVICE_CATEGORY_LABEL } from '../../../data/catalog';
import { duration, num } from '../../../lib/utils';

// Excludes time spent waiting on the tenant — a technician (or their
// department) isn't measured on how long someone else took to answer.
const effectiveResolutionMs = (r: { resolvedAt?: number; createdAt: number; slaPausedMs?: number }) =>
  (r.resolvedAt ?? r.createdAt) - r.createdAt - (r.slaPausedMs ?? 0);

interface PerfRow { id: string; name: string; sub?: string; resolved: number; open: number; avgMs: number }

export default function Performance() {
  const data = useLive((w) => ({
    requests: w.requests.map((r) => ({ ...r, tenantName: w.tenantById[r.tenantId]?.name ?? '—', tenantCode: w.tenantById[r.tenantId]?.code ?? '—' })),
    departments: w.departments,
    technicians: w.technicians,
  }));
  const requests = data.requests;

  const isOpen = (s: string) => !['closed', 'confirmed', 'cancelled'].includes(s);
  const resolvedTimes = requests.filter((r) => r.resolvedAt).map((r) => r.resolvedAt! - r.createdAt);
  const avg = resolvedTimes.length ? resolvedTimes.reduce((s, x) => s + x, 0) / resolvedTimes.length : 0;

  const rowsFor = (bucket: Array<{ id: string; name: string; sub?: string }>, key: 'departmentId' | 'technicianId'): PerfRow[] =>
    bucket
      .map((b) => {
        const own = requests.filter((r) => r[key] === b.id);
        const resolved = own.filter((r) => r.resolvedAt);
        const totalMs = resolved.reduce((s, r) => s + effectiveResolutionMs(r), 0);
        return { id: b.id, name: b.name, sub: b.sub, resolved: resolved.length, open: own.filter((r) => isOpen(r.status)).length, avgMs: resolved.length ? totalMs / resolved.length : 0 };
      })
      .filter((r) => r.resolved > 0 || r.open > 0)
      .sort((a, b) => b.resolved - a.resolved || b.open - a.open);

  const deptRows = rowsFor(data.departments.map((d) => ({ id: d.id, name: d.name })), 'departmentId');
  const techRows = rowsFor(
    data.technicians.map((t) => ({ id: t.id, name: t.name, sub: data.departments.find((d) => d.id === t.departmentId)?.name })),
    'technicianId',
  );

  const perfColumns: Column<PerfRow>[] = [
    { key: 'name', header: 'Name', cell: (r) => <div><p className="font-medium text-foreground">{r.name}</p>{r.sub && <p className="text-[11px] text-subtle">{r.sub}</p>}</div>, sortValue: (r) => r.name },
    { key: 'resolved', header: 'Resolved', cell: (r) => <span className="tnum">{num(r.resolved)}</span>, sortValue: (r) => r.resolved },
    { key: 'open', header: 'Open', cell: (r) => <span className="tnum">{num(r.open)}</span>, sortValue: (r) => r.open, hideBelow: 'sm' },
    { key: 'avg', header: 'Avg resolution', cell: (r) => <span className="tnum">{r.avgMs ? duration(r.avgMs) : '—'}</span>, sortValue: (r) => r.avgMs, hideBelow: 'md' },
  ];

  // Category distribution.
  const byCategory = Object.keys(SERVICE_CATEGORY_LABEL).map((c) => ({ label: SERVICE_CATEGORY_LABEL[c], value: requests.filter((r) => r.category === c).length })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);

  // Priority distribution.
  const byPriority = (['critical', 'high', 'medium', 'low'] as const).map((p) => ({ label: p[0].toUpperCase() + p.slice(1), value: requests.filter((r) => r.priority === p).length }));

  // Volume over the last 14 days.
  const volume = Array.from({ length: 14 }).map((_, i) => {
    const day = new Date(NOW - (13 - i) * 86_400_000);
    const start = new Date(day); start.setHours(0, 0, 0, 0);
    const end = start.getTime() + 86_400_000;
    return { label: day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), created: requests.filter((r) => r.createdAt >= start.getTime() && r.createdAt < end).length, resolved: requests.filter((r) => r.resolvedAt && r.resolvedAt >= start.getTime() && r.resolvedAt < end).length };
  });

  // Per-tenant activity.
  const perTenant = Object.values(requests.reduce((acc, r) => { (acc[r.tenantCode] ??= { label: r.tenantCode, value: 0 }).value++; return acc; }, {} as Record<string, { label: string; value: number }>)).sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <Page>
      <PageHeader title="Service Performance" description="Volume, distribution and resolution analytics for the service center." />

      <StatGrid cols={4}>
        <StatCard label="Total Requests" value={num(requests.length)} icon={Wrench} tone="service" />
        <StatCard label="Open" value={num(requests.filter((r) => isOpen(r.status)).length)} icon={Wrench} tone="primary" />
        <StatCard label="Avg Resolution" value={avg ? duration(avg) : '—'} icon={Clock} tone="neutral" />
        <StatCard label="Resolved" value={num(requests.filter((r) => r.resolvedAt).length)} icon={Wrench} tone="success" />
      </StatGrid>

      <SplitGrid>
        <Card>
          <CardHeader title="Request Volume" subtitle="Created vs resolved, last 14 days" icon={<IconBox icon={BarChart3} tone="service" size="sm" />} />
          <CardBody><BarSeriesChart data={volume} series={[{ key: 'created', label: 'Created' }, { key: 'resolved', label: 'Resolved', color: 'var(--viz-3)' }]} height={240} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Priority Distribution" icon={<IconBox icon={Wrench} tone="service" size="sm" />} />
          <CardBody className="flex flex-col justify-center">
            <DonutChart height={200} centreValue={num(requests.length)} centreLabel="total" data={byPriority.map((p, i) => ({ label: p.label, value: p.value, color: ['var(--critical)', 'var(--warning)', 'var(--info)', 'var(--neutral)'][i] }))} />
          </CardBody>
        </Card>
      </SplitGrid>

      <ContentGrid>
        <Card>
          <CardHeader title="Category Distribution" icon={<IconBox icon={BarChart3} tone="service" size="sm" />} />
          <CardBody><BarSeriesChart data={byCategory} series={[{ key: 'value', label: 'Requests' }]} horizontal height={280} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Per-Tenant Activity" subtitle="Most requests raised" icon={<IconBox icon={BarChart3} tone="primary" size="sm" />} />
          <CardBody><BarSeriesChart data={perTenant} series={[{ key: 'value', label: 'Requests', color: 'var(--viz-6)' }]} horizontal height={280} /></CardBody>
        </Card>
      </ContentGrid>

      <ContentGrid>
        <Card>
          <CardHeader
            title="Department Performance"
            subtitle="Resolution time excludes time spent waiting on the tenant"
            icon={<IconBox icon={Users} tone="service" size="sm" />}
          />
          <DataTable rows={deptRows} columns={perfColumns} rowKey={(r) => r.id} pageSize={13} emptyTitle="No department activity yet" />
        </Card>
        <Card>
          <CardHeader
            title="Technician Performance"
            subtitle="Same measure, per person"
            icon={<IconBox icon={UserCog} tone="service" size="sm" />}
          />
          <DataTable rows={techRows} columns={perfColumns} rowKey={(r) => r.id} pageSize={10} emptyTitle="No technician activity yet" />
        </Card>
      </ContentGrid>
    </Page>
  );
}
