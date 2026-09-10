/**
 * Admin — a visitor operations list, reused for Scheduled, In Building,
 * Overstaying and History (§24). Search, tenant filter, a table with the host
 * tenant, and the reception drawer.
 */

import { AlarmClock, CalendarClock, DoorOpen, History as HistoryIcon } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ListToolbar } from '../../../components/layout/list-toolbar';
import { Page } from '../../../components/layout/page';
import { PageHeader } from '../../../components/patterns/page-header';
import { Field } from '../../../components/ui/field';
import { SearchInput } from '../../../components/ui/input';
import { SimpleSelect } from '../../../components/ui/select';
import { VisitorTable, VisitorDrawer } from '../../visitorsShared';
import { useLive } from '../../../data/live';
import type { Visitor, VisitorStatus } from '../../../data/types';

export type VisitorListKind = 'scheduled' | 'inside' | 'overstaying' | 'history';

const META: Record<VisitorListKind, { title: string; description: string; icon: typeof DoorOpen; match: (s: VisitorStatus) => boolean }> = {
  scheduled: { title: 'Scheduled visitors', description: 'Everyone expected across the park.', icon: CalendarClock, match: (s) => s === 'scheduled' },
  inside: { title: 'Visitors in building', description: 'Who is inside right now, by tenant.', icon: DoorOpen, match: (s) => s === 'in_building' || s === 'overstaying' },
  overstaying: { title: 'Overstaying visitors', description: 'Visitors past their expected departure time.', icon: AlarmClock, match: (s) => s === 'overstaying' },
  history: { title: 'Visitor history', description: 'Completed, cancelled and no-show visits.', icon: HistoryIcon, match: (s) => s === 'checked_out' || s === 'cancelled' || s === 'no_show' },
};

export function AdminVisitorList({ kind }: { kind: VisitorListKind }) {
  const meta = META[kind];
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('all');

  const data = useLive((w) => ({
    tenants: w.tenants.filter((t) => t.status === 'active' || t.status === 'suspended'),
    visitors: w.visitors.filter((v) => meta.match(v.status)),
    nameFor: (id: string) => w.tenantById[id]?.name ?? '—',
  }));

  const openId = params.get('open');
  const open = openId ? data.visitors.find((v) => v.id === openId) ?? null : null;

  const filtered = data.visitors.filter((v) => {
    if (tenantFilter !== 'all' && v.tenantId !== tenantFilter) return false;
    const t = search.trim().toLowerCase();
    if (t && !(v.fullName.toLowerCase().includes(t) || (v.company ?? '').toLowerCase().includes(t) || v.reference.toLowerCase().includes(t))) return false;
    return true;
  });

  return (
    <Page workspace archetype={kind === 'history' ? 'data' : 'operational'} className="ds-data-workspace">
      <PageHeader eyebrow={`Visitor operations · ${kind === 'history' ? 'Records' : 'Live workflow'}`} title={meta.title} description={meta.description} />
      <ListToolbar summary={`${filtered.length} matching visitors`} onReset={search || tenantFilter !== 'all' ? () => { setSearch(''); setTenantFilter('all'); } : undefined}>
        <Field label="Search"><SearchInput value={search} onChange={setSearch} placeholder="Name, company or reference…" label="Search visitors" /></Field>
        <Field label="Tenant" className="sm:max-w-[280px]"><SimpleSelect value={tenantFilter} onChange={setTenantFilter} options={[{ value: 'all', label: 'All tenants' }, ...data.tenants.map((t) => ({ value: t.id, label: t.name }))]} /></Field>
      </ListToolbar>
        <VisitorTable
          visitors={filtered}
          onOpen={(v: Visitor) => setParams({ open: v.id })}
          selectedKey={openId ?? undefined}
          showTenant={(v) => data.nameFor(v.tenantId)}
          emptyTitle={`No ${kind === 'inside' ? 'visitors inside' : kind + ' visitors'}`}
          emptyDescription={kind === 'overstaying' ? 'Everyone is within their expected time.' : undefined}
          resetKey={`${search}|${tenantFilter}`}
        />
      <VisitorDrawer visitor={open} open={Boolean(open)} onOpenChange={(o) => !o && setParams({})} mode="admin" tenantName={open ? data.nameFor(open.tenantId) : undefined} />
    </Page>
  );
}
