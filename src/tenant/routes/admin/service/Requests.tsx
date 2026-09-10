/**
 * Admin — Service Requests (§30). The table view of the service management
 * workspace: filters across category, priority, status, tenant and overdue,
 * operational metrics, and the request detail drawer.
 */

import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../../../components/layout/page';
import { ListToolbar } from '../../../components/layout/list-toolbar';
import { PageHeader } from '../../../components/patterns/page-header';
import { StatCard } from '../../../components/patterns/stat-card';
import { Field } from '../../../components/ui/field';
import { SearchInput } from '../../../components/ui/input';
import { SimpleSelect } from '../../../components/ui/select';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { PriorityBadge, ServiceStatusBadge, CATEGORY_ICON } from '../../../components/patterns/status-badge';
import { ServiceRequestDrawer } from '../../serviceShared';
import { SERVICE_CATEGORY_LABEL, departmentById } from '../../../data/catalog';
import { useLive } from '../../../data/live';
import { NOW } from '../../../data/world';
import { ago, duration, num } from '../../../lib/utils';
import { SERVICE_STATUS } from '../../../lib/meta';
import { Button } from '../../../components/ui/button';
import type { ServicePriority, ServiceRequest, ServiceStatus } from '../../../data/types';

const STATUS_OPTS: Array<{ value: ServiceStatus | 'open' | 'all'; label: string }> = [
  { value: 'open', label: 'Open' }, { value: 'all', label: 'All statuses' },
  ...Object.entries(SERVICE_STATUS).map(([value, meta]) => ({ value: value as ServiceStatus, label: meta.label })),
];

const PRIORITY_OPTS = [{ value: 'all', label: 'All priorities' }, { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }];
const CATEGORY_OPTS = [{ value: 'all', label: 'All categories' }, ...Object.entries(SERVICE_CATEGORY_LABEL).map(([value, label]) => ({ value, label }))];

export default function Requests() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ServiceStatus | 'open' | 'all'>('open');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);

  const data = useLive((w) => ({
    tenants: w.tenants.filter((t) => t.status === 'active' || t.status === 'suspended'),
    requests: w.requests.map((r) => ({
      ...r,
      tenantName: w.tenantById[r.tenantId]?.name ?? '—',
      departmentName: departmentById(r.departmentId)?.name,
      technicianName: w.technicians.find((t) => t.id === r.technicianId)?.name,
    })),
  }));

  const openId = params.get('open');
  const open = openId ? data.requests.find((r) => r.id === openId) ?? null : null;

  const isOpen = (s: ServiceStatus) => !['closed', 'confirmed', 'cancelled'].includes(s);
  const filtered = data.requests.filter((r) => {
    if (status === 'open') { if (!isOpen(r.status)) return false; }
    else if (status !== 'all' && r.status !== status) return false;
    if (priority !== 'all' && r.priority !== priority) return false;
    if (category !== 'all' && r.category !== category) return false;
    if (overdueOnly && !(r.dueAt && r.dueAt < NOW && isOpen(r.status))) return false;
    if (tenantFilter !== 'all' && r.tenantId !== tenantFilter) return false;
    const t = search.trim().toLowerCase();
    if (t && !(r.title.toLowerCase().includes(t) || r.reference.toLowerCase().includes(t) || r.tenantName.toLowerCase().includes(t))) return false;
    return true;
  });

  const openReqs = data.requests.filter((r) => isOpen(r.status));
  const resolvedTimes = data.requests.filter((r) => r.resolvedAt).map((r) => r.resolvedAt! - r.createdAt);
  const avgResolution = resolvedTimes.length ? resolvedTimes.reduce((s, x) => s + x, 0) / resolvedTimes.length : 0;

  const columns: Column<(typeof data.requests)[number]>[] = [
    { key: 'ref', header: 'Ref', cell: (r) => <span className="tnum text-subtle">{r.reference}</span>, sortValue: (r) => r.reference, hideBelow: 'md' },
    { key: 'title', header: 'Request', cell: (r) => { const Icon = CATEGORY_ICON[r.category]; return <div className="flex items-center gap-2.5"><Icon className="h-4 w-4 shrink-0 text-subtle" /><div className="min-w-0"><p className="font-medium text-foreground ds-request-title">{r.title}</p><p className="text-xs text-subtle">{r.tenantName}</p></div></div>; }, sortValue: (r) => r.title },
    { key: 'priority', header: 'Priority', cell: (r) => <PriorityBadge priority={r.priority} size="sm" />, sortValue: (r) => ({ critical: 0, high: 1, medium: 2, low: 3 } as Record<ServicePriority, number>)[r.priority], hideBelow: 'sm' },
    { key: 'status', header: 'Status', cell: (r) => <ServiceStatusBadge status={r.status} size="sm" />, sortValue: (r) => SERVICE_STATUS[r.status].label },
    {
      key: 'assignee',
      header: 'Assigned to',
      cell: (r) => r.technicianName ? (
        <div className="min-w-0">
          <p className="truncate text-foreground">{r.technicianName}</p>
          <p className="text-xs text-subtle">{r.departmentName}</p>
        </div>
      ) : r.status === 'acknowledged' ? (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-warning">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />Unassigned
        </span>
      ) : (
        <span className="text-subtle">—</span>
      ),
      sortValue: (r) => r.technicianName ?? '',
      hideBelow: 'lg',
    },
    { key: 'due', header: 'Due', cell: (r) => r.dueAt && r.dueAt < NOW && isOpen(r.status) ? <span className="text-critical">Overdue</span> : <span className="tnum text-subtle">{r.dueAt ? ago(r.dueAt) : '—'}</span>, hideBelow: 'lg' },
    { key: 'updated', header: 'Updated', cell: (r) => <span className="tnum text-subtle">{ago(r.updatedAt)}</span>, sortValue: (r) => r.updatedAt, hideBelow: 'xl' },
  ];

  const resetFilters = () => { setSearch(''); setStatus('open'); setPriority('all'); setCategory('all'); setTenantFilter('all'); setOverdueOnly(false); };
  const hasFilters = Boolean(search || status !== 'open' || priority !== 'all' || category !== 'all' || tenantFilter !== 'all' || overdueOnly);
  const openRequest = (id: string) => setParams(previous => { const next = new URLSearchParams(previous); next.set('open', id); return next; });
  const closeRequest = () => setParams(previous => { const next = new URLSearchParams(previous); next.delete('open'); return next; });
  return (
    <Page workspace className="ds-service-workspace">
      <nav className="ds-nav-tabs" aria-label="Service center"><Link to="/admin/service" aria-current="page">Requests</Link><Link to="/admin/service/board">Board</Link><Link to="/admin/service/performance">Performance</Link></nav>
      <PageHeader eyebrow="Service center · Park operations" title="Service requests" description="Prioritize issues, coordinate your teams, and keep every tenant moving."
        actions={<Button asChild><Link to="/admin/service/board">Open board<ArrowUpRight /></Link></Button>} />
      <div className="ds-metrics is-five">
        <StatCard variant="inline" label="Open requests" value={num(openReqs.length)} caption="Across all tenants" onClick={() => { resetFilters(); }} />
        <StatCard variant="inline" label="Critical" value={num(openReqs.filter((r) => r.priority === 'critical').length)} caption="Needs immediate attention" onClick={() => { resetFilters(); setPriority('critical'); }} />
        <StatCard variant="inline" label="Overdue" value={num(openReqs.filter((r) => r.dueAt && r.dueAt < NOW).length)} caption="Past response target" onClick={() => { resetFilters(); setOverdueOnly(true); }} />
        <StatCard variant="inline" label="Avg. resolution" value={avgResolution ? duration(avgResolution) : '—'} caption="Across resolved requests" className="ds-duration-metric" />
        <StatCard variant="inline" label="Resolved today" value={num(data.requests.filter((r) => r.resolvedAt && r.resolvedAt >= NOW - 86_400_000).length)} caption="Within the last 24 hours" />
      </div>
      <ListToolbar summary={`${filtered.length} matching requests${overdueOnly ? ' · Overdue only' : ''}`} onReset={hasFilters ? resetFilters : undefined}>
        <Field label="Search"><SearchInput value={search} onChange={setSearch} placeholder="Request, reference or tenant…" label="Search requests" /></Field>
        <Field label="Status"><SimpleSelect value={status} onChange={setStatus} options={STATUS_OPTS} className="w-full" /></Field>
        <Field label="Priority"><SimpleSelect value={priority} onChange={setPriority} options={PRIORITY_OPTS} className="w-full" /></Field>
        <Field label="Category"><SimpleSelect value={category} onChange={setCategory} options={CATEGORY_OPTS} className="w-full" /></Field>
        <Field label="Tenant"><SimpleSelect value={tenantFilter} onChange={setTenantFilter} options={[{ value: 'all', label: 'All tenants' }, ...data.tenants.map((t) => ({ value: t.id, label: t.name }))]} className="w-full" /></Field>
      </ListToolbar>
      <DataTable rows={filtered} columns={columns} rowKey={(r) => r.id} rowLabel={(r) => `${r.reference}: ${r.title}`} label="Service requests"
        onRowClick={(r) => openRequest(r.id)} selectedKey={openId ?? undefined} resetKey={[search,status,priority,category,tenantFilter,overdueOnly].join('|')}
        emptyTitle="No requests match these filters" emptyDescription="Try a broader search or reset the filters to see open requests." emptyAction={<Button onClick={resetFilters}>Reset filters</Button>} pageSize={14} />
      <ServiceRequestDrawer request={open as ServiceRequest | null} open={Boolean(open)} onOpenChange={(o) => !o && closeRequest()} mode="admin" tenantName={open?.tenantName} />
    </Page>
  );
}
