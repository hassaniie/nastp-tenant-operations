/**
 * Admin — Users. The administrative account and the role architecture. One
 * Admin role today; the model is designed so more roles slot in without a
 * redesign. A park-wide view of tenant portal users is included for oversight.
 */

import { ShieldCheck, UserRound } from 'lucide-react';
import { Page, ContentGrid } from '../../components/ui/page';
import { Card, CardBody, CardHeader } from '../../components/ui/card';
import { PageHeader } from '../../components/common';
import { Avatar, IconBox, StatusBadge } from '../../components/ui/primitives';
import { DataTable, type Column } from '../../components/ui/data';
import { ADMIN_ROLE, USER_ROLE } from '../../lib/meta';
import { useLive } from '../../data/live';
import { ago } from '../../lib/utils';

// The technician roles are already real accounts (§ Phase 1) — this list is
// only what has no login yet.
const FUTURE_ROLES = ['Building Admin', 'Energy Manager', 'Finance Manager', 'Receptionist', 'Tenant Manager'];

export default function Users() {
  const admins = useLive((w) => w.admins);
  const users = useLive((w) => w.users.map((u) => ({ ...u, tenantName: w.tenantById[u.tenantId]?.name ?? '—' })));

  const columns: Column<(typeof users)[number]>[] = [
    { key: 'name', header: 'User', cell: (u) => <div className="flex items-center gap-2.5"><Avatar name={u.name} seed={u.avatarSeed} size={28} /><div><p className="font-medium text-foreground">{u.name}</p><p className="text-[11px] text-subtle">{u.email}</p></div></div>, sortValue: (u) => u.name },
    { key: 'tenant', header: 'Tenant', cell: (u) => u.tenantName, sortValue: (u) => u.tenantName, hideBelow: 'md' },
    { key: 'role', header: 'Role', cell: (u) => <StatusBadge tone={u.role === 'primary' ? 'primary' : 'neutral'} size="sm" dot={false}>{USER_ROLE[u.role]}</StatusBadge>, sortValue: (u) => u.role },
    { key: 'status', header: 'Status', cell: (u) => <StatusBadge tone={u.status === 'active' ? 'success' : u.status === 'invited' ? 'info' : 'neutral'} size="sm">{u.status}</StatusBadge> },
    { key: 'last', header: 'Last active', cell: (u) => <span className="text-subtle">{u.lastActiveAt ? ago(u.lastActiveAt) : '—'}</span>, hideBelow: 'lg' },
  ];

  return (
    <Page>
      <PageHeader title="Users" description="Administrative accounts and the role architecture." />

      <ContentGrid align="start">
        <Card>
          <CardHeader title="Administrators" subtitle={`${admins.length} accounts with a login on the control plane`} icon={<IconBox icon={ShieldCheck} tone="primary" size="sm" />} />
          <CardBody className="flex flex-col gap-2">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-inset/50 p-3.5">
                <Avatar name={a.name} seed={a.avatarSeed} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-foreground">{a.name}</p>
                  <p className="truncate text-[12px] text-subtle">{a.title} · {a.org}</p>
                </div>
                <StatusBadge tone={ADMIN_ROLE[a.role].tone} size="sm" dot={false}>{ADMIN_ROLE[a.role].label}</StatusBadge>
                <StatusBadge tone={a.status === 'active' ? 'success' : 'neutral'} size="sm">{a.status === 'active' ? 'Active' : 'Disabled'}</StatusBadge>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Role Architecture" subtitle="Three admin roles today, designed to scale" icon={<IconBox icon={ShieldCheck} tone="neutral" size="sm" />} />
          <CardBody>
            <div className="mb-3 flex flex-col gap-2">
              {(Object.keys(ADMIN_ROLE) as (keyof typeof ADMIN_ROLE)[]).map((role) => (
                <div key={role} className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-inset p-3">
                  <StatusBadge tone={ADMIN_ROLE[role].tone} size="sm" dot={false}>{ADMIN_ROLE[role].label}</StatusBadge>
                  <span className="text-[12px] text-muted">{ADMIN_ROLE[role].description}</span>
                </div>
              ))}
            </div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">Planned roles</p>
            <div className="flex flex-wrap gap-1.5">
              {FUTURE_ROLES.map((r) => <span key={r} className="rounded-lg border border-border bg-surface-inset px-2.5 py-1 text-[12px] text-muted">{r}</span>)}
            </div>
          </CardBody>
        </Card>
      </ContentGrid>

      <Card>
        <CardHeader title="Tenant Portal Users" subtitle={`${users.length} users across all tenants`} icon={<IconBox icon={UserRound} tone="visitor" size="sm" />} />
        <DataTable rows={users} columns={columns} rowKey={(u) => u.id} pageSize={12} />
      </Card>
    </Page>
  );
}
