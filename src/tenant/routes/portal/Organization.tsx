/**
 * Tenant Portal — Organization. The tenant's own profile: contacts, offices,
 * meters, users and the contract/configuration summary. Read-only, scoped to
 * the signed-in tenant.
 */

import { Mail, Phone } from 'lucide-react';
import { Page } from '../../components/layout/page';
import { WorkspaceSection } from '../../components/layout/workspace-section';
import { WorkspaceSplit } from '../../components/layout/workspace-split';
import { PageHeader } from '../../components/patterns/page-header';
import { KeyValue } from '../../components/patterns/key-value';
import { Avatar, TenantMark } from '../../components/ui/avatar';
import { StatusBadge } from '../../components/patterns/status-badge';
import { DefList } from '../../components/patterns/definition-list';
import { TenantStatusBadge, MeterStatusBadge } from '../../components/patterns/status-badge';
import { USER_ROLE } from '../../lib/meta';
import { ORG_TYPE_LABEL } from '../../data/catalog';
import { useSession } from '../../store/session';
import { useLive } from '../../data/live';
import { area, ago, fmtDateFull } from '../../lib/utils';

export default function Organization() {
  const { tenantId } = useSession();
  const data = useLive((w) => {
    const t = w.tenantById[tenantId];
    return {
      tenant: t,
      building: w.buildingById[t?.buildingId ?? '']?.name ?? '—',
      floors: (t?.floorIds ?? []).map((f) => w.floorById[f]?.name ?? '—'),
      offices: w.offices.filter((o) => o.tenantId === tenantId),
      meters: w.meters.filter((m) => m.tenantId === tenantId),
      users: w.users.filter((u) => u.tenantId === tenantId),
    };
  });
  const t = data.tenant;
  if (!t) return null;
  const totalArea = data.offices.reduce((s, o) => s + o.areaSqft, 0);

  return (
    <Page workspace archetype="detail" className="ds-portal-workspace">
      <PageHeader title="Organization" description="Your organization profile, spaces and users." />

      <WorkspaceSection>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <TenantMark name={t.name} hue={t.brandHue} size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-foreground">{t.name}</h2>
              <TenantStatusBadge status={t.status} />
            </div>
            <p className="mt-0.5 text-[13px] text-muted">{t.legalName} · {ORG_TYPE_LABEL[t.organizationType]}</p>
            <p className="mt-1 text-[12px] text-subtle">{data.building} · {data.floors.join(', ')}</p>
          </div>
        </div>
      </WorkspaceSection>

      <WorkspaceSplit ratio="equal">
        <WorkspaceSection title="Details">
            <DefList columns={2} items={[
              { label: 'Registration', value: t.registrationNo ?? '—' },
              { label: 'NTN / Tax ID', value: t.ntn ?? '—' },
              { label: 'Contract start', value: t.contractStart ? fmtDateFull(t.contractStart) : '—' },
              { label: 'Contract end', value: t.contractEnd ? fmtDateFull(t.contractEnd) : '—' },
              { label: 'Total area', value: area(totalArea) },
              { label: 'Offices', value: String(data.offices.length) },
            ]} />
        </WorkspaceSection>
        <WorkspaceSection title="Primary Contact">
          <div className="flex flex-col gap-1">
            <KeyValue label="Name" value={t.primaryContact.name} />
            <KeyValue label="Designation" value={t.primaryContact.designation} />
            <KeyValue label={<span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />Email</span>} value={t.primaryContact.email} />
            <KeyValue label={<span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />Phone</span>} value={t.primaryContact.phone} mono />
          </div>
        </WorkspaceSection>
      </WorkspaceSplit>

      <WorkspaceSplit ratio="equal">
        <WorkspaceSection title="Offices & Meters">
          <div className="flex flex-col">
            {data.offices.map((o) => {
              const meter = data.meters.find((m) => m.id === o.meterId);
              return (
                <div key={o.id} className="ds-operational-row px-0">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{o.label} · {o.code}</p>
                    <p className="text-[11px] text-subtle">{area(o.areaSqft)}{meter ? ` · ${meter.serial}` : ' · not metered'}</p>
                  </div>
                  {meter && <MeterStatusBadge status={meter.status} size="sm" />}
                </div>
              );
            })}
          </div>
        </WorkspaceSection>
        <WorkspaceSection title="Users" description={`${data.users.length} users`}>
          <div className="flex flex-col">
            {data.users.map((u) => (
              <div key={u.id} className="ds-operational-row px-0">
                <Avatar name={u.name} seed={u.avatarSeed} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{u.name}</p>
                  <p className="truncate text-[11px] text-subtle">{USER_ROLE[u.role]} · {u.lastActiveAt ? `active ${ago(u.lastActiveAt)}` : u.status}</p>
                </div>
                <StatusBadge tone={u.status === 'active' ? 'success' : u.status === 'invited' ? 'info' : 'neutral'} size="sm">{u.status}</StatusBadge>
              </div>
            ))}
          </div>
        </WorkspaceSection>
      </WorkspaceSplit>
    </Page>
  );
}
