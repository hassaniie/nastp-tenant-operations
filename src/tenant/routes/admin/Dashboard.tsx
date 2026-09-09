/**
 * Admin — Ecosystem Operations Dashboard (§8).
 *
 * Rebuilt on ReUI's Frame language. The page is no longer a field of floating
 * cards: related figures share one `Frame`, and each `FramePanel` nests inside
 * it with a concentric radius, so grouping is carried by the surface itself
 * rather than by whitespace between boxes.
 *
 * Composition follows the registry's own examples — `c-alert-17` (status rows
 * stacked inside a Frame) for the attention feed, `c-card-15` (metric with a
 * quiet label above a dominant figure) for the KPI band.
 *
 * Not a generic KPI grid: the top band is the park's live state, the middle is
 * energy intelligence beside what needs attention right now, the lower band is
 * tenant operations. Reads the live world synchronously.
 */

import {
  AlarmClock, ArrowRight, Bell, Building2, DoorOpen, Gauge, UserPlus, Wrench, Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from '../../components/reui/frame';
import { Badge } from '../../components/reui/badge';
import { IconTile } from '../../components/reui/icon-tile';
import { Alert, AlertDescription, AlertTitle } from '../../components/reui/alert';
import { Button } from '../../components/shadcn/button';
import { ScrollArea } from '../../components/shadcn/scroll-area';
import { TrendChart, BarSeriesChart, Sparkline } from '../../components/charts';
import { useLive } from '../../data/live';
import { computeAdminKpis, aggregateReadings, tenantSummary } from '../../data/selectors';
import { ago, cn, compact, currency, energy, fmtTime, num } from '../../lib/utils';
import { ACTIVITY_ICON } from '../../lib/activityMeta';
import { CATEGORY_ICON } from '../../components/status';
import { TENANT_STATUS } from '../../lib/meta';

/** Attention tones map onto ReUI's alert vocabulary. Severity still reads from
 *  the tag text, so colour is never the only signal. */
const ALERT_VARIANT: Record<AttentionItem['tone'], 'destructive' | 'warning' | 'info'> = {
  critical: 'destructive',
  warning: 'warning',
  energy: 'warning',
  visitor: 'info',
  service: 'info',
};

/** Tenant lifecycle tones map onto ReUI's badge vocabulary, still sourced from
 *  lib/meta so the status vocabulary stays single-origin. */
const BADGE_VARIANT: Record<string, 'success-light' | 'destructive-light' | 'warning-light' | 'info-light' | 'secondary'> = {
  success: 'success-light',
  critical: 'destructive-light',
  warning: 'warning-light',
  info: 'info-light',
  neutral: 'secondary',
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

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-4 p-4 lg:gap-5 lg:p-6">
      {/* ------------------------------------------------------- page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[19px] font-semibold tracking-[-0.02em] text-foreground">Ecosystem Operations</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Live command view across tenants, energy, visitors and the service center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success-light" size="sm" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
            Live
          </Badge>
          <Button size="sm" onClick={() => navigate('/admin/tenants/new')}>
            <UserPlus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* --------------------------------------------------------- KPI band */}
      <Frame className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <KpiPanel
          label="Active Tenants" value={num(kpis.tenantsActive)} icon={Building2} tone="text-primary"
          caption={`${kpis.tenantsPending} pending · ${kpis.tenantsSuspended} suspended`}
          onClick={() => navigate('/admin/tenants')}
        />
        <KpiPanel
          label="Current Load" value={energy(kpis.currentLoadKw, 'kW').value} unit={energy(kpis.currentLoadKw, 'kW').unit}
          icon={Zap} tone="text-energy" caption={`Peak ${num(kpis.peakDemandKw)} kW`}
          spark={consumptionSpark} onClick={() => navigate('/admin/energy')}
        />
        <KpiPanel
          label="Visitors Inside" value={num(kpis.visitorsInside)} icon={DoorOpen} tone="text-visitor"
          caption={`${kpis.visitorsScheduledToday} scheduled today`}
          onClick={() => navigate('/admin/visitors/inside')}
        />
        <KpiPanel
          label="Open Requests" value={num(kpis.requestsOpen)} icon={Wrench} tone="text-service"
          caption={`${kpis.requestsCritical} critical · ${kpis.requestsOverdue} overdue`}
          onClick={() => navigate('/admin/service')}
        />
      </Frame>

      {/* ------------------------------------------- supporting totals strip */}
      <Frame>
        <FramePanel className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0! lg:grid-cols-4">
          <MetricCell label="Month Consumption" value={energy(kpis.totalConsumptionKwh).value} unit={energy(kpis.totalConsumptionKwh).unit} caption="All active tenants" />
          <MetricCell label="Month Charges" value={currency(kpis.totalChargesMonth, { compact: true })} caption="Billing period to date" />
          <MetricCell
            label="Overstaying" value={num(kpis.visitorsOverstaying)}
            badge={kpis.visitorsOverstaying ? { variant: 'destructive-light', text: 'Needs attention' } : { variant: 'success-light', text: 'Clear' }}
            onClick={() => navigate('/admin/visitors/overstaying')}
          />
          <MetricCell
            label="Offline Meters" value={num(kpis.offlineMeters)}
            caption={`of ${num(kpis.metersTotal)} monitored`}
            badge={kpis.offlineMeters ? { variant: 'destructive-light', text: 'Action needed' } : { variant: 'success-light', text: 'All online' }}
            onClick={() => navigate('/admin/energy/meters')}
          />
        </FramePanel>
      </Frame>

      {/* -------------------------- energy intelligence + operational attention */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-5">
        <Frame stacked>
          <FramePanel>
            <FrameHeader className="flex-row items-start justify-between gap-3">
              <div className="min-w-0">
                <FrameTitle>Consumption &amp; Peak Demand</FrameTitle>
                <FrameDescription>Park-wide, last 30 days</FrameDescription>
              </div>
              <Button variant="ghost" size="sm" className="-me-1.5 shrink-0" onClick={() => navigate('/admin/energy')}>
                Energy <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </FrameHeader>
            <TrendChart
              data={daily}
              series={[{ key: 'kwh', label: 'Consumption (kWh)' }]}
              unit="kWh"
              height={224}
              valueFormatter={(v) => `${num(v)} kWh`}
            />
          </FramePanel>
          <FramePanel>
            <FrameHeader>
              <FrameTitle>Highest Consuming Tenants</FrameTitle>
              <FrameDescription>This billing period</FrameDescription>
            </FrameHeader>
            <BarSeriesChart
              data={ranking.map((r) => ({ label: r.tenant.code, kwh: r.periodKwh }))}
              series={[{ key: 'kwh', label: 'kWh' }]}
              horizontal
              height={186}
              valueFormatter={(v) => `${num(v)} kWh`}
            />
          </FramePanel>
        </Frame>

        {/* The queue is unbounded, so in the two-column layout the frame is
            taken out of flow: the cell then contributes no intrinsic height,
            the energy column sizes the row, and the list scrolls inside
            whatever height that yields. Left in flow it grew to 1230px and
            stranded ~480px of empty space beside the charts. */}
        <div className="relative min-h-[420px]">
          <Frame className="flex min-h-0 flex-col xl:absolute xl:inset-0">
            <FramePanel className="flex min-h-0 flex-1 flex-col overflow-hidden p-0!">
              <FrameHeader className="flex-row items-center justify-between gap-3 border-b border-border">
                <div className="min-w-0">
                  <FrameTitle>Operational Attention</FrameTitle>
                  <FrameDescription>Ranked by urgency across every domain</FrameDescription>
                </div>
                <Badge variant={attention.length ? 'warning-light' : 'success-light'} size="sm" className="shrink-0 tabular-nums">
                  {attention.length}
                </Badge>
              </FrameHeader>

              {attention.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <IconTile variant="soft" size="lg" className="text-success"><Bell /></IconTile>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Nothing needs attention</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">All tenants nominal across every domain.</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="min-h-0 flex-1">
                  <div className="divide-y divide-border">
                    {attention.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.href)}
                        className="block w-full text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
                      >
                        <Alert variant={ALERT_VARIANT[item.tone]} className="border-0 bg-transparent shadow-none">
                          <item.icon />
                          <AlertTitle className="flex items-baseline justify-between gap-2">
                            <span className="truncate">{item.title}</span>
                            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.09em] opacity-70">{item.tag}</span>
                          </AlertTitle>
                          <AlertDescription>
                            <span className="block truncate">{item.detail}</span>
                            <span className="mt-0.5 block truncate text-muted-foreground">{item.tenant} · {ago(item.ts)}</span>
                          </AlertDescription>
                        </Alert>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </FramePanel>
          </Frame>
        </div>
      </div>

      {/* ------------------------------------------------- tenant operations */}
      {/* items-start, not stretch: these three panels genuinely vary in length,
          and stretching the short ones strands the difference as empty space
          inside the card, which reads as a bug rather than as breathing room. */}
      <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-5">
        <Frame>
          <FramePanel className="p-0!">
            <FrameHeader className="border-b border-border">
              <FrameTitle>Recent Activity</FrameTitle>
              <FrameDescription>Across all tenants</FrameDescription>
            </FrameHeader>
            <ul className="divide-y divide-border">
              {activity.map((a) => {
                const Icon = ACTIVITY_ICON[a.kind] ?? Bell;
                const tone = a.domain === 'energy' ? 'text-energy' : a.domain === 'visitor' ? 'text-visitor' : a.domain === 'service' ? 'text-service' : 'text-primary';
                return (
                  <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                    <IconTile variant="soft" size="sm" className={cn('mt-0.5 shrink-0', tone)}><Icon /></IconTile>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[13px] font-medium text-foreground">{a.title}</p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{ago(a.ts)}</span>
                      </div>
                      {a.detail && <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{a.detail}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </FramePanel>
        </Frame>

        <Frame>
          <FramePanel className="p-0!">
            <FrameHeader className="flex-row items-center justify-between gap-3 border-b border-border">
              <div className="min-w-0">
                <FrameTitle>Upcoming Visitors</FrameTitle>
                <FrameDescription>Next arrivals</FrameDescription>
              </div>
              <Button variant="ghost" size="sm" className="-me-1.5 shrink-0" onClick={() => navigate('/admin/visitors/scheduled')}>All</Button>
            </FrameHeader>
            {upcoming.length === 0 ? (
              <p className="px-4 py-10 text-center text-[12px] text-muted-foreground">No upcoming visitors.</p>
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{v.fullName}</p>
                      {v.company && <p className="truncate text-[11.5px] text-muted-foreground">{v.company}</p>}
                    </div>
                    <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-muted-foreground">{fmtTime(v.expectedArrival)}</span>
                  </li>
                ))}
              </ul>
            )}
          </FramePanel>
        </Frame>

        <Frame>
          <FramePanel className="p-0!">
            <FrameHeader className="flex-row items-center justify-between gap-3 border-b border-border">
              <div className="min-w-0">
                <FrameTitle>Recent Onboarding</FrameTitle>
                <FrameDescription>Newest tenants</FrameDescription>
              </div>
              <Button variant="ghost" size="sm" className="-me-1.5 shrink-0" onClick={() => navigate('/admin/tenants')}>All</Button>
            </FrameHeader>
            <ul className="divide-y divide-border">
              {recentTenants.map((r) => {
                const meta = TENANT_STATUS[r.tenant.status];
                return (
                  <li key={r.tenant.id}>
                    <button
                      onClick={() => navigate(`/admin/tenants/${r.tenant.id}`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold text-white"
                        style={{ background: `hsl(${r.tenant.brandHue} 62% 45%)` }}
                        aria-hidden
                      >
                        {r.tenant.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">{r.tenant.name}</p>
                        <p className="truncate text-[11.5px] text-muted-foreground">{r.buildingName} · {ago(r.tenant.createdAt)}</p>
                      </div>
                      <Badge variant={BADGE_VARIANT[meta.tone] ?? 'secondary'} size="xs" className="shrink-0">{meta.label}</Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </FramePanel>
        </Frame>
      </div>

      <p className="pb-1 text-center text-[11.5px] text-muted-foreground">
        Live values update every few seconds · {compact(kpis.metersTotal)} meters monitored across the park
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ KPI panel */

function KpiPanel({
  label, value, unit, icon: Icon, tone, caption, spark, onClick,
}: {
  label: string; value: string; unit?: string; icon: typeof Zap; tone: string;
  caption: string; spark?: number[]; onClick: () => void;
}) {
  return (
    <FramePanel className="overflow-hidden p-0!">
      <button
        onClick={onClick}
        className="flex w-full flex-col gap-3.5 px-4 pb-3 pt-3.5 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-medium text-muted-foreground">{label}</span>
          <IconTile variant="soft" size="sm" className={cn('shrink-0', tone)}><Icon /></IconTile>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-foreground">{value}</span>
          {unit && <span className="text-[12px] font-medium text-muted-foreground">{unit}</span>}
        </div>

        <div className="flex min-h-[20px] items-end justify-between gap-3">
          <span className="truncate text-[11.5px] text-muted-foreground">{caption}</span>
          {spark && spark.length > 1 && (
            <span className="w-20 shrink-0 opacity-70">
              <Sparkline data={spark} height={20} color="var(--module-energy)" />
            </span>
          )}
        </div>
      </button>
    </FramePanel>
  );
}

/* --------------------------------------------------------- metric cell */

function MetricCell({
  label, value, unit, caption, badge, onClick,
}: {
  label: string; value: string; unit?: string; caption?: string;
  badge?: { variant: 'success-light' | 'destructive-light'; text: string };
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="truncate text-[11.5px] font-medium text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[17px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground">{value}</span>
        {unit && <span className="text-[11px] font-medium text-muted-foreground">{unit}</span>}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {badge && <Badge variant={badge.variant} size="xs" className="shrink-0">{badge.text}</Badge>}
        {caption && <span className="truncate text-[11px] text-muted-foreground">{caption}</span>}
      </div>
    </>
  );
  const cls = 'flex flex-col gap-2 bg-card px-4 py-3.5 text-left';
  return onClick ? (
    <button onClick={onClick} className={cn(cls, 'transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset')}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
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
