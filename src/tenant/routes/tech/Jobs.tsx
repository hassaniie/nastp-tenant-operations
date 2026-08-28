/**
 * The technician's queue.
 *
 * Deliberately sparser than the admin rail: what is on me, in the order I
 * should work it. Priority first, then due time — an overdue critical job and
 * a low-priority one raised this morning must not sit next to each other
 * looking alike.
 *
 * Only this technician's own work. No park-wide view, no other queues.
 * Opening a job hands off to the same request drawer the admin and tenant
 * use, in `tech` mode — start work, log a note (tenant-visible or internal),
 * attach a photo, and resolve with a required note explaining what was done.
 */

import { useMemo, useState } from 'react';
import { AlarmClock, CheckCircle2, Wrench } from 'lucide-react';
import { Page, StatGrid } from '../../components/ui/page';
import { Card, CardBody, CardHeader } from '../../components/ui/card';
import { StatCard, PageHeader } from '../../components/common';
import { IconBox, StatusBadge } from '../../components/ui/primitives';
import { EmptyState } from '../../components/ui/data';
import { PriorityBadge, ServiceStatusBadge, CATEGORY_ICON } from '../../components/status';
import { ServiceRequestDrawer } from '../serviceShared';
import { useLive } from '../../data/live';
import { useAuth } from '../../store/auth';
import { departmentById, OPEN_TECH_STATUSES, SERVICE_CATEGORY_LABEL } from '../../data/catalog';
import { ago, fmtDateTime, num } from '../../lib/utils';
import type { ServicePriority, ServiceRequest } from '../../data/types';

const PRIORITY_RANK: Record<ServicePriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default function TechJobs() {
  const { session } = useAuth();
  const technicianId = session?.subjectId;
  const [openId, setOpenId] = useState<string | null>(null);

  const data = useLive((w) => {
    const me = w.technicians.find((t) => t.id === technicianId);
    const mine = w.requests.filter((r) => r.technicianId === technicianId);
    return {
      me,
      department: me ? departmentById(me.departmentId) : undefined,
      active: mine.filter((r) => OPEN_TECH_STATUSES.has(r.status)),
      resolved: mine.filter((r) => r.status === 'resolved' || r.status === 'confirmed' || r.status === 'closed'),
      tenantName: (id: string) => w.tenantById[id]?.name ?? 'Unknown tenant',
      open: openId ? mine.find((r) => r.id === openId) ?? null : null,
    };
  });

  const queue = useMemo(
    () =>
      [...data.active].sort(
        (a, b) =>
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
          (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity),
      ),
    [data.active],
  );

  const recentlyCompleted = useMemo(
    () => [...data.resolved].sort((a, b) => (b.resolvedAt ?? b.updatedAt) - (a.resolvedAt ?? a.updatedAt)).slice(0, 5),
    [data.resolved],
  );

  const overdue = queue.filter((r) => r.dueAt && r.dueAt < Date.now()).length;

  return (
    <Page>
      <PageHeader
        title={`Your jobs`}
        description={
          data.department
            ? `${data.department.name} · ${data.me?.availability.replace(/_/g, '-')} · shift ${data.me?.shift.start}–${data.me?.shift.end}`
            : 'Assigned work, highest priority first.'
        }
      />

      <StatGrid cols={3}>
        <StatCard label="Open jobs" value={num(queue.length)} icon={Wrench} tone="service" caption="Assigned to you" />
        <StatCard
          label="Overdue"
          value={num(overdue)}
          icon={AlarmClock}
          tone={overdue ? 'critical' : 'success'}
          caption={overdue ? 'Past the agreed time' : 'All within time'}
        />
        <StatCard label="Completed" value={num(data.resolved.length)} icon={CheckCircle2} tone="success" caption="Resolved or closed" />
      </StatGrid>

      <Card>
        <CardHeader
          title="Queue"
          subtitle="Priority first, then due time"
          icon={<IconBox icon={Wrench} tone="service" size="sm" />}
        />
        <CardBody className="flex flex-col gap-2">
          {queue.length === 0 ? (
            <EmptyState
              title="Nothing assigned right now"
              description="New work will appear here as soon as it is dispatched to you."
              icon={<IconBox icon={CheckCircle2} tone="success" size="lg" />}
            />
          ) : (
            queue.map((r) => <JobRow key={r.id} request={r} tenantName={data.tenantName(r.tenantId)} onOpen={() => setOpenId(r.id)} />)
          )}
        </CardBody>
      </Card>

      {recentlyCompleted.length > 0 && (
        <Card>
          <CardHeader
            title="Recently completed"
            subtitle="Your last few resolved jobs"
            icon={<IconBox icon={CheckCircle2} tone="success" size="sm" />}
          />
          <CardBody className="flex flex-col gap-2">
            {recentlyCompleted.map((r) => (
              <JobRow key={r.id} request={r} tenantName={data.tenantName(r.tenantId)} onOpen={() => setOpenId(r.id)} />
            ))}
          </CardBody>
        </Card>
      )}

      <ServiceRequestDrawer
        request={data.open}
        open={Boolean(data.open)}
        onOpenChange={(o) => !o && setOpenId(null)}
        mode="tech"
        tenantName={data.open ? data.tenantName(data.open.tenantId) : undefined}
      />
    </Page>
  );
}

function JobRow({ request: r, tenantName, onOpen }: { request: ServiceRequest; tenantName: string; onOpen: () => void }) {
  const Icon = CATEGORY_ICON[r.category] ?? Wrench;
  const isOverdue = Boolean(r.dueAt && r.dueAt < Date.now());

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-inset/50 p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-inset"
    >
      <IconBox icon={Icon} tone="service" size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="truncate text-[13px] font-medium text-foreground">{r.title}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <PriorityBadge priority={r.priority} size="sm" />
            <ServiceStatusBadge status={r.status} size="sm" />
          </div>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-muted">
          {r.reference} · {SERVICE_CATEGORY_LABEL[r.category]} · {tenantName}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-subtle">
          <span>{r.location ?? 'Location not given'}</span>
          <span>Raised {ago(r.createdAt)}</span>
          {r.dueAt && (
            <span className={isOverdue ? 'font-medium text-critical' : undefined}>
              {isOverdue ? 'Overdue since ' : 'Due '}
              {fmtDateTime(r.dueAt)}
            </span>
          )}
          {isOverdue && <StatusBadge tone="critical" size="sm" dot={false}>Overdue</StatusBadge>}
        </div>
      </div>
    </button>
  );
}
