/**
 * Admin — Security. The access log: every sign-in, failure, lockout, reset
 * and impersonation, across all three experiences. Read-only and append-only
 * in this UI on purpose — nothing here offers to edit or delete an entry.
 *
 * Not derived from the World: access events are session-scoped, recorded by
 * `data/auth.ts` as they happen, and read fresh on every render.
 */

import { useMemo, useState } from 'react';
import {
  AlertTriangle, KeyRound, LogIn, LogOut, ShieldAlert, ShieldCheck, UserCog, type LucideIcon,
} from 'lucide-react';
import { Page, StatGrid } from '../../components/ui/page';
import { Card, CardBody, CardHeader } from '../../components/ui/card';
import { PageHeader, StatCard } from '../../components/common';
import { IconBox, StatusBadge } from '../../components/ui/primitives';
import { DataTable, EmptyState, type Column } from '../../components/ui/data';
import { SimpleSelect } from '../../components/ui/form';
import { authEvents } from '../../data/auth';
import { fmtDateTime, num } from '../../lib/utils';
import type { AuthEvent, AuthEventKind } from '../../data/types';

const KIND_META: Record<AuthEventKind, { label: string; icon: LucideIcon; tone: 'success' | 'critical' | 'warning' | 'info' | 'neutral' }> = {
  signin: { label: 'Signed in', icon: LogIn, tone: 'success' },
  signout: { label: 'Signed out', icon: LogOut, tone: 'neutral' },
  signin_failed: { label: 'Sign-in failed', icon: ShieldAlert, tone: 'critical' },
  lockout: { label: 'Locked out', icon: AlertTriangle, tone: 'critical' },
  reset_requested: { label: 'Reset requested', icon: KeyRound, tone: 'info' },
  reset_completed: { label: 'Password reset', icon: KeyRound, tone: 'success' },
  invite_accepted: { label: 'Invite accepted', icon: ShieldCheck, tone: 'success' },
  impersonation_start: { label: 'Impersonation started', icon: UserCog, tone: 'warning' },
  impersonation_end: { label: 'Impersonation ended', icon: UserCog, tone: 'neutral' },
};

const FILTERS = [
  { value: 'all', label: 'All events' },
  { value: 'signin', label: 'Sign-ins' },
  { value: 'signin_failed', label: 'Failures' },
  { value: 'lockout', label: 'Lockouts' },
  { value: 'impersonation_start', label: 'Impersonation' },
] as const;

export default function Security() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('all');
  // Read on every render rather than through useLive — the log is not part of
  // the deterministic World, it is what actually happened this session.
  const all = authEvents();

  const rows = useMemo(() => {
    if (filter === 'all') return all;
    if (filter === 'impersonation_start') return all.filter((e) => e.kind === 'impersonation_start' || e.kind === 'impersonation_end');
    return all.filter((e) => e.kind === filter);
  }, [all, filter]);

  const failures = all.filter((e) => e.kind === 'signin_failed').length;
  const lockouts = all.filter((e) => e.kind === 'lockout').length;
  const impersonations = all.filter((e) => e.kind === 'impersonation_start').length;

  const columns: Column<AuthEvent>[] = [
    {
      key: 'kind',
      header: 'Event',
      cell: (e) => {
        const meta = KIND_META[e.kind];
        return (
          <div className="flex items-center gap-2.5">
            <IconBox icon={meta.icon} tone={meta.tone} size="sm" />
            <StatusBadge tone={meta.tone} size="sm">{meta.label}</StatusBadge>
          </div>
        );
      },
    },
    { key: 'email', header: 'Account', cell: (e) => <span className="font-mono text-[12px] text-foreground">{e.email}</span> },
    { key: 'experience', header: 'Door', cell: (e) => <span className="capitalize text-subtle">{e.experience}</span>, hideBelow: 'md' },
    { key: 'detail', header: 'Detail', cell: (e) => <span className="text-subtle">{e.detail ?? '—'}</span>, hideBelow: 'lg' },
    { key: 'ts', header: 'When', cell: (e) => <span className="tnum text-subtle">{fmtDateTime(e.ts)}</span>, sortValue: (e) => e.ts },
  ];

  return (
    <Page>
      <PageHeader title="Security" description="Every sign-in, failure and impersonation, across all three doors." />

      <StatGrid cols={3}>
        <StatCard label="Failed sign-ins" value={num(failures)} icon={ShieldAlert} tone={failures ? 'warning' : 'success'} caption="This session" />
        <StatCard label="Lockouts" value={num(lockouts)} icon={AlertTriangle} tone={lockouts ? 'critical' : 'success'} caption="This session" />
        <StatCard label="Impersonations" value={num(impersonations)} icon={UserCog} tone="neutral" caption="Admin support access" />
      </StatGrid>

      <Card>
        <CardHeader
          title="Access log"
          subtitle={`${rows.length} event${rows.length === 1 ? '' : 's'}`}
          icon={<IconBox icon={ShieldCheck} tone="primary" size="sm" />}
          actions={<SimpleSelect value={filter} onChange={(v) => setFilter(v as typeof filter)} options={[...FILTERS]} className="w-[180px]" />}
        />
        <CardBody className="p-0">
          {rows.length === 0 ? (
            <EmptyState
              title="Nothing recorded yet"
              description="Sign-ins, failures and impersonation will appear here as they happen."
              icon={<IconBox icon={ShieldCheck} tone="success" size="lg" />}
            />
          ) : (
            <DataTable rows={rows} columns={columns} rowKey={(e) => e.id} emptyTitle="No events" pageSize={20} />
          )}
        </CardBody>
      </Card>
    </Page>
  );
}
