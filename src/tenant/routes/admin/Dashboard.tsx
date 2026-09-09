/**
 * Admin — Ecosystem Operations (§8).
 *
 * Composed around what an operator does, not around the shape of the data.
 *
 *   • One vitals rail, not eight metric boxes. Four live figures at 34px on a
 *     single hairline-divided surface. No icon tiles: the number is the point.
 *   • Triage is the dominant column. The park's problems are what this page is
 *     for, so they get the width; energy reads beside them, not instead.
 *   • The old metric strip is gone, and its four figures moved to where they
 *     mean something. Month consumption and charges are energy context, so
 *     they sit in the energy header. Overstays and offline meters are
 *     *problems*, so they sit in triage as counts — and keep their routes.
 *   • Activity, arrivals and onboarding share one tabbed panel instead of
 *     three cards, which gives each a full-width row and drops three borders.
 *
 * Four surfaces total, down from eleven. Every metric, list and navigation
 * target from the previous version survives.
 */

import {
  AlarmClock, ArrowUpRight, Bell, ChevronRight, Gauge, UserPlus, Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Frame, FramePanel } from '../../components/reui/frame';
import { Badge } from '../../components/reui/badge';
import { IconTile } from '../../components/reui/icon-tile';
import { Button } from '../../components/shadcn/button';
import { ScrollArea } from '../../components/shadcn/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/shadcn/tabs';
import { TrendChart, Sparkline } from '../../components/charts';
import { useLive } from '../../data/live';
import { computeAdminKpis, aggregateReadings, tenantSummary } from '../../data/selectors';
import { ago, cn, compact, currency, energy, fmtTime, num } from '../../lib/utils';
import { ACTIVITY_ICON } from '../../lib/activityMeta';
import { CATEGORY_ICON } from '../../components/status';
import { TENANT_STATUS } from '../../lib/meta';

/** Severity drives a 3px rail and a text tag — never colour alone. */
const SEVERITY: Record<AttentionItem['tone'], { rail: string; text: string }> = {
  critical: { rail: 'bg-critical', text: 'text-critical' },
  warning: { rail: 'bg-warning', text: 'text-warning' },
  energy: { rail: 'bg-energy', text: 'text-energy' },
  visitor: { rail: 'bg-visitor', text: 'text-visitor' },
  service: { rail: 'bg-service', text: 'text-service' },
};

const STATUS_BADGE: Record<string, 'success-light' | 'destructive-light' | 'warning-light' | 'info-light' | 'secondary'> = {
  success: 'success-light', critical: 'destructive-light', warning: 'warning-light', info: 'info-light', neutral: 'secondary',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const kpis = useLive(computeAdminKpis);
  const daily = useLive((w) => aggregateReadings(w, 'daily'));
  const ranking = useLive((w) => w.tenants.filter((t) => t.status === 'active').map((t) => tenantSummary(w, t.id)).sort((a, b) => b.periodKwh - a.periodKwh).slice(0, 6));
  const attention = useLive(buildAttention);
  const activity = useLive((w) => w.activity.slice(0, 8));
  const upcoming = useLive((w) => w.visitors.filter((v) => v.status === 'scheduled').sort((a, b) => a.expectedArrival - b.expectedArrival).slice(0, 7));
  const recentTenants = useLive((w) => [...w.tenants].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6).map((t) => tenantSummary(w, t.id)));

  const consumptionSpark = daily.slice(-14).map((d) => d.kwh);
  const topKwh = ranking[0]?.periodKwh || 1;

  return (
    <div className="mx-auto flex max-w-[1560px] flex-col gap-6 px-5 py-6 lg:px-8 lg:py-8">
      {/* ------------------------------------------ command header, no card */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.022em] text-foreground">Ecosystem Operations</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            {num(kpis.tenantsActive)} active tenants · {num(kpis.metersTotal)} meters monitored · {num(kpis.requestsOpen)} open requests
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-[pulse-ring_2.4s_ease-in-out_infinite]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live
          </span>
          <Button size="sm" onClick={() => navigate('/admin/tenants/new')}>
            <UserPlus className="h-4 w-4" /> Add Tenant
          </Button>
        </div>
      </header>

      {/* -------------------------------------------------------- vitals rail */}
      <Frame dense>
        <FramePanel className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0! lg:grid-cols-4">
          <Vital
            label="Current load" value={energy(kpis.currentLoadKw, 'kW').value} unit={energy(kpis.currentLoadKw, 'kW').unit}
            meta={`Peak ${num(kpis.peakDemandKw)} kW`} spark={consumptionSpark} onClick={() => navigate('/admin/energy')}
          />
          <Vital
            label="Open requests" value={num(kpis.requestsOpen)}
            meta={`${num(kpis.requestsCritical)} critical · ${num(kpis.requestsOverdue)} overdue`}
            alarm={kpis.requestsCritical > 0} onClick={() => navigate('/admin/service')}
          />
          <Vital
            label="Visitors inside" value={num(kpis.visitorsInside)}
            meta={`${num(kpis.visitorsScheduledToday)} scheduled today`} onClick={() => navigate('/admin/visitors/inside')}
          />
          <Vital
            label="Active tenants" value={num(kpis.tenantsActive)}
            meta={`${num(kpis.tenantsPending)} pending · ${num(kpis.tenantsSuspended)} suspended`}
            onClick={() => navigate('/admin/tenants')}
          />
        </FramePanel>
      </Frame>

      {/* ------------------------------------------------ triage beside energy */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* ---- triage: the page's reason for existing */}
        <Frame className="flex min-w-0 min-h-[560px] flex-col">
          <FramePanel className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden p-0!">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">Operational Attention</h2>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">Ranked by urgency across every domain</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <TriageCount
                  n={kpis.visitorsOverstaying} label="overstaying" icon={AlarmClock}
                  onClick={() => navigate('/admin/visitors/overstaying')}
                />
                <TriageCount
                  n={kpis.offlineMeters} label="meters offline" icon={Gauge}
                  onClick={() => navigate('/admin/energy/meters')}
                />
              </div>
            </div>

            {attention.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                <IconTile variant="soft" size="lg" className="text-success"><Bell /></IconTile>
                <div>
                  <p className="text-[14px] font-medium text-foreground">Nothing needs attention</p>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">All tenants nominal across every domain.</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="min-h-0 w-full flex-1 [&>div>div]:block!">
                <ul className="w-full min-w-0">
                  {attention.map((item) => {
                    const sev = SEVERITY[item.tone];
                    return (
                      <li key={item.id} className="min-w-0 border-b border-border/70 last:border-b-0">
                        <button
                          onClick={() => navigate(item.href)}
                          className="group flex w-full min-w-0 items-stretch gap-0 text-left transition-colors hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
                        >
                          <span aria-hidden className={cn('w-[3px] shrink-0', sev.rail)} />
                          <span className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                            <item.icon className={cn('h-[18px] w-[18px] shrink-0', sev.text)} aria-hidden />
                            <span className="min-w-0 flex-1">
                              <span className="flex min-w-0 items-baseline gap-2.5">
                                <span className={cn('shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.08em]', sev.text)}>{item.tag}</span>
                                <span className="min-w-0 truncate text-[14px] font-medium text-foreground">{item.title}</span>
                              </span>
                              <span className="mt-1 block truncate text-[12.5px] text-muted-foreground">
                                {item.detail} · {item.tenant}
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-3">
                              <span className="font-mono text-[12px] tabular-nums text-muted-foreground">{ago(item.ts)}</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-foreground" aria-hidden />
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </FramePanel>
        </Frame>

        {/* ---- energy: trend over ranked consumers, one surface.
             self-start so it sizes to its content instead of stretching to the
             triage column's height, which stranded ~190px of empty panel under
             the chart. */}
        <Frame stacked className="min-w-0 self-start">
          <FramePanel className="p-0!">
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">Load &amp; Consumption</h2>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">Park-wide, last 30 days</p>
              </div>
              <Button variant="ghost" size="sm" className="-me-2 shrink-0" onClick={() => navigate('/admin/energy')}>
                Energy <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            {/* Period totals live here, where they are context rather than a
                free-floating statistic. */}
            <div className="flex items-end gap-8 px-5 pb-4">
              <div>
                <p className="text-[12px] text-muted-foreground">This period</p>
                <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground">
                  {energy(kpis.totalConsumptionKwh).value}
                  <span className="ml-1 text-[12.5px] font-medium text-muted-foreground">{energy(kpis.totalConsumptionKwh).unit}</span>
                </p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Charges</p>
                <p className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground">
                  {currency(kpis.totalChargesMonth, { compact: true })}
                </p>
              </div>
            </div>
            <div className="px-2 pb-3">
              <TrendChart
                data={daily}
                series={[{ key: 'kwh', label: 'Consumption (kWh)' }]}
                unit="kWh"
                height={196}
                valueFormatter={(v) => `${num(v)} kWh`}
              />
            </div>
          </FramePanel>

          <FramePanel className="p-0!">
            <div className="px-5 py-4">
              <h3 className="text-[13.5px] font-semibold text-foreground">Top consumers</h3>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">This billing period</p>
            </div>
            {/* A ranked read, not a second chart: six rows scan faster than six
                bars, and the proportion still shows. */}
            <ul className="px-5 pb-5">
              {ranking.map((r) => (
                <li key={r.tenant.id} className="flex items-center gap-3 py-[7px]">
                  <span className="w-16 shrink-0 truncate font-mono text-[12px] text-muted-foreground">{r.tenant.code}</span>
                  <span className="h-[7px] min-w-0 flex-1 overflow-hidden rounded-full bg-muted-surface">
                    <span
                      className="block h-full rounded-full bg-energy/80"
                      style={{ width: `${Math.max(4, (r.periodKwh / topKwh) * 100)}%` }}
                    />
                  </span>
                  <span className="w-20 shrink-0 text-right text-[12.5px] tabular-nums text-foreground">
                    {compact(r.periodKwh)} <span className="text-muted-foreground">kWh</span>
                  </span>
                </li>
              ))}
            </ul>
          </FramePanel>
        </Frame>
      </div>

      {/* -------------------------------------- one tabbed operations panel */}
      <Frame>
        <FramePanel className="p-0!">
          <Tabs defaultValue="activity">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
              <TabsList className="bg-transparent p-0">
                <TabsTrigger value="activity" className="rounded-lg px-3 py-1.5 text-[13.5px] data-[state=active]:bg-accent">Activity</TabsTrigger>
                <TabsTrigger value="arrivals" className="rounded-lg px-3 py-1.5 text-[13.5px] data-[state=active]:bg-accent">Arrivals</TabsTrigger>
                <TabsTrigger value="onboarding" className="rounded-lg px-3 py-1.5 text-[13.5px] data-[state=active]:bg-accent">Onboarding</TabsTrigger>
              </TabsList>
              <p className="hidden text-[12.5px] text-muted-foreground sm:block">
                Live values update every few seconds
              </p>
            </div>

            <TabsContent value="activity" className="mt-0">
              <ul className="divide-y divide-border/70">
                {activity.map((a) => {
                  const Icon = ACTIVITY_ICON[a.kind] ?? Bell;
                  const tone = a.domain === 'energy' ? 'text-energy' : a.domain === 'visitor' ? 'text-visitor' : a.domain === 'service' ? 'text-service' : 'text-primary';
                  return (
                    <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                      <IconTile variant="soft" size="sm" className={cn('shrink-0', tone)}><Icon /></IconTile>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-foreground">{a.title}</p>
                        {a.detail && <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{a.detail}</p>}
                      </div>
                      <span className="shrink-0 font-mono text-[12px] tabular-nums text-muted-foreground">{ago(a.ts)}</span>
                    </li>
                  );
                })}
              </ul>
            </TabsContent>

            <TabsContent value="arrivals" className="mt-0">
              {upcoming.length === 0 ? (
                <p className="px-5 py-12 text-center text-[13px] text-muted-foreground">No upcoming visitors.</p>
              ) : (
                <ul className="divide-y divide-border/70">
                  {upcoming.map((v) => (
                    <li key={v.id} className="flex items-center gap-4 px-5 py-3">
                      <span className="w-16 shrink-0 font-mono text-[12.5px] tabular-nums text-foreground">{fmtTime(v.expectedArrival)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-foreground">{v.fullName}</p>
                        {v.company && <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{v.company}</p>}
                      </div>
                      <Button variant="ghost" size="sm" className="-me-2 shrink-0 text-muted-foreground" onClick={() => navigate('/admin/visitors/scheduled')}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="onboarding" className="mt-0">
              <ul className="divide-y divide-border/70">
                {recentTenants.map((r) => {
                  const meta = TENANT_STATUS[r.tenant.status];
                  return (
                    <li key={r.tenant.id}>
                      <button
                        onClick={() => navigate(`/admin/tenants/${r.tenant.id}`)}
                        className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold text-white"
                          style={{ background: `hsl(${r.tenant.brandHue} 60% 44%)` }}
                          aria-hidden
                        >
                          {r.tenant.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-foreground">{r.tenant.name}</p>
                          <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{r.buildingName} · {ago(r.tenant.createdAt)}</p>
                        </div>
                        <Badge variant={STATUS_BADGE[meta.tone] ?? 'secondary'} size="sm" className="shrink-0">{meta.label}</Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </TabsContent>
          </Tabs>
        </FramePanel>
      </Frame>
    </div>
  );
}

/* ------------------------------------------------------------ vitals cell */

function Vital({
  label, value, unit, meta, spark, alarm, onClick,
}: {
  label: string; value: string; unit?: string; meta: string;
  spark?: number[]; alarm?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex min-w-0 flex-col gap-3 overflow-hidden bg-card px-5 py-5 text-left transition-colors hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
    >
      <span className="flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
        {label}
        {alarm && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-critical" />}
      </span>

      <span className="flex items-end justify-between gap-3">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[34px] font-semibold leading-none tracking-[-0.032em] tabular-nums text-foreground">{value}</span>
          {unit && <span className="text-[14px] font-medium text-muted-foreground">{unit}</span>}
        </span>
        {spark && spark.length > 1 && (
          <span className="hidden w-20 shrink-0 overflow-hidden opacity-60 transition-opacity group-hover:opacity-100 sm:block">
            <Sparkline data={spark} height={26} color="var(--module-energy)" />
          </span>
        )}
      </span>

      <span className="truncate text-[12.5px] text-muted-foreground">{meta}</span>
    </button>
  );
}

/* ------------------------------------------------------- triage counters */

function TriageCount({ n, label, icon: Icon, onClick }: { n: number; label: string; icon: typeof Zap; onClick: () => void }) {
  const bad = n > 0;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        bad
          ? 'border-critical/25 bg-critical/10 text-critical hover:bg-critical/15'
          : 'border-border text-muted-foreground hover:bg-accent/60 hover:text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="font-semibold tabular-nums">{num(n)}</span>
      <span className={cn(bad ? 'text-critical/80' : 'text-muted-foreground')}>{label}</span>
    </button>
  );
}

/* --------------------------------------------------- attention builder */

interface AttentionItem {
  id: string;
  icon: typeof Zap;
  tone: 'critical' | 'warning' | 'energy' | 'visitor' | 'service';
  tag: string;
  title: string;
  detail: string;
  tenant: string;
  ts: number;
  href: string;
  rank: number;
}

function buildAttention(w: import('../../data/world').World): AttentionItem[] {
  const items: AttentionItem[] = [];
  const tenantName = (id: string) => w.tenantById[id]?.name ?? '—';

  for (const r of w.requests.filter((x) => x.priority === 'critical' && !['closed', 'confirmed', 'cancelled'].includes(x.status))) {
    items.push({ id: `req-${r.id}`, icon: CATEGORY_ICON[r.category], tone: 'critical', tag: 'Critical', title: r.title, detail: `${r.reference} · ${r.category.replace('_', ' ')}`, tenant: tenantName(r.tenantId), ts: r.updatedAt, href: `/admin/service?open=${r.id}`, rank: 0 });
  }
  for (const v of w.visitors.filter((x) => x.status === 'overstaying')) {
    items.push({ id: `vis-${v.id}`, icon: AlarmClock, tone: 'warning', tag: 'Overstay', title: `${v.fullName} overstaying`, detail: v.company ?? v.purpose, tenant: tenantName(v.tenantId), ts: v.expectedDeparture, href: '/admin/visitors/overstaying', rank: 1 });
  }
  for (const m of w.meters.filter((x) => x.status === 'offline' && x.tenantId)) {
    items.push({ id: `mtr-${m.id}`, icon: Gauge, tone: 'critical', tag: 'Offline', title: `${m.name} offline`, detail: `Serial ${m.serial}`, tenant: tenantName(m.tenantId!), ts: m.lastReadingAt, href: '/admin/energy/meters', rank: 0 });
  }
  for (const a of w.alerts.filter((x) => x.status === 'active' && (x.severity === 'warning' || x.severity === 'critical') && x.kind !== 'meter_offline')) {
    items.push({ id: `al-${a.id}`, icon: Zap, tone: 'energy', tag: a.severity === 'critical' ? 'Critical' : 'High', title: a.title, detail: a.description, tenant: tenantName(a.tenantId), ts: a.ts, href: '/admin/energy/alerts', rank: 2 });
  }
  return items.sort((a, b) => a.rank - b.rank || b.ts - a.ts).slice(0, 12);
}
