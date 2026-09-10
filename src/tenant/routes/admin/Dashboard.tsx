import {
  AlarmClock,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCheck,
  Gauge,
  Plus,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useLive } from "../../data/live";
import {
  computeAdminKpis,
  aggregateReadings,
  tenantSummary,
} from "../../data/selectors";
import { ago, compact, currency, energy, fmtTime, num } from "../../lib/utils";
import { ACTIVITY_ICON } from "../../lib/activityMeta";
import { CATEGORY_ICON, PriorityBadge, MeterStatusBadge, VisitorStatusBadge, AlertSeverityBadge, TenantStatusBadge } from '../../components/patterns/status-badge';
import { PageHeader } from '../../components/patterns/page-header';
import { StatCard } from '../../components/patterns/stat-card';
import { SectionHeader } from '../../components/patterns/section-header';

function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="ops-text-link" to={to}>
      {children}
      <ArrowUpRight size={15} />
    </Link>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const kpis = useLive(computeAdminKpis);
  const daily = useLive((w) => aggregateReadings(w, "daily"));
  const ranking = useLive((w) =>
    w.tenants
      .filter((t) => t.status === "active")
      .map((t) => tenantSummary(w, t.id))
      .sort((a, b) => b.periodKwh - a.periodKwh)
      .slice(0, 6),
  );
  const attention = useLive(buildAttention);
  const activity = useLive((w) => w.activity.slice(0, 8));
  const upcoming = useLive((w) =>
    w.visitors
      .filter((v) => v.status === "scheduled")
      .sort((a, b) => a.expectedArrival - b.expectedArrival)
      .slice(0, 7),
  );
  const recentTenants = useLive((w) =>
    [...w.tenants]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 6)
      .map((t) => tenantSummary(w, t.id)),
  );
  const [measure, setMeasure] = useState("kwh");
  const [chartTable, setChartTable] = useState(false);
  const [queueFilter, setQueueFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const selectedAttention = attention.filter(
    (a) =>
      queueFilter === "all" ||
      (queueFilter === "critical" ? a.rank === 0 : a.rank !== 0),
  );
  const queue = showAll ? selectedAttention : selectedAttention.slice(0, 5);
  const consumption = energy(kpis.totalConsumptionKwh);
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
  const chartKey = measure === "kwh" ? "kwh" : "demandKw";
  const chartUnit = measure === "kwh" ? "kWh" : "kW";
  return (
    <div className="ops-dashboard">
      <nav className="ops-module-nav" aria-label="Operations modules">
        <Link to="/admin" aria-current="page">
          Overview
        </Link>
        <Link to="/admin/tenants">Tenants</Link>
        <Link to="/admin/energy">Energy</Link>
        <Link to="/admin/visitors">Visitors</Link>
        <Link to="/admin/service">Service center</Link>
      </nav>
      <PageHeader className="ops-page-heading" title={<>Operations overview<span>.</span></>} description="Your park at a glance. Every tenant, every operation."
        eyebrow={<>Park intelligence <span className="ops-live"><i />Live</span></>}
        actions={<div className="ops-heading-actions"><span className="ops-date"><CalendarDays size={15} />{today}</span><Button variant="primary" onClick={() => navigate('/admin/tenants/new')}><Plus />Add tenant</Button></div>} />
      <div className="ds-metrics">
        <StatCard variant="inline" to="/admin/tenants" label="Active tenants" value={num(kpis.tenantsActive)} unit={`/ ${num(kpis.tenantsTotal)}`} caption={<>{kpis.tenantsPending} pending<span>·</span>{kpis.tenantsSuspended} suspended</>} />
        <StatCard variant="inline" to="/admin/energy" label="Current load" value={energy(kpis.currentLoadKw, 'kW').value} unit="kW" caption={<><span className="ops-live-dot" />Live demand<span>·</span>Meter peak {num(kpis.peakDemandKw)} kW</>} />
        <StatCard variant="inline" to="/admin/visitors/inside" label="Visitors inside" value={num(kpis.visitorsInside)} unit="people" caption={`${kpis.visitorsScheduledToday} scheduled today`} />
        <StatCard variant="inline" to="/admin/service" label="Open requests" value={num(kpis.requestsOpen)} unit="requests" caption={<><span className={kpis.requestsCritical ? 'ops-danger' : ''}>{kpis.requestsCritical} critical</span><span>·</span>{kpis.requestsOverdue} overdue</>} />
      </div>
      <div className="ops-energy-grid">
        <section className="ops-energy-main" aria-labelledby="energy-title">
          <div className="ops-section-title">
            <div>
              <h2 id="energy-title">Energy performance</h2>
              <p>Park-wide consumption · Last 30 days</p>
            </div>
            <TextLink to="/admin/energy">Explore energy</TextLink>
          </div>
          <div className="ops-energy-summary">
            <div>
              <span>Month consumption</span>
              <strong>
                {consumption.value}
                <small>{consumption.unit}</small>
              </strong>
              <p>Across all active tenants</p>
            </div>
            <div>
              <span>Month charges</span>
              <strong className="ops-charge">
                {currency(kpis.totalChargesMonth, { compact: true })}
              </strong>
              <p>Current billing period</p>
            </div>
          </div>
          <div className="ops-chart-toolbar">
            <Tabs value={measure} onValueChange={setMeasure}>
              <TabsList className="ops-segmented" aria-label="Energy measure">
                <TabsTrigger
                  value="kwh"
                  id="energy-tab-kwh"
                  aria-controls="energy-panel"
                >
                  Consumption
                </TabsTrigger>
                <TabsTrigger
                  value="demandKw"
                  id="energy-tab-demandKw"
                  aria-controls="energy-panel"
                >
                  Peak demand
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              className="ops-text-button"
              onClick={() => setChartTable((v) => !v)}
            >
              {chartTable ? "Show chart" : "View data"}
            </button>
          </div>
          <div
            id="energy-panel"
            role="tabpanel"
            aria-labelledby={`energy-tab-${measure}`}
            tabIndex={0}
          >
            {chartTable ? (
              <div className="ops-chart-data">
                <Table aria-label="Daily energy readings">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Consumption (kWh)</TableHead>
                      <TableHead>Demand (kW)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daily.map((d) => (
                      <TableRow key={d.ts}>
                        <TableCell>{d.label}</TableCell>
                        <TableCell>{num(d.kwh)}</TableCell>
                        <TableCell>{num(d.demandKw)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div
                className="ops-energy-chart"
                role="img"
                aria-label={`${measure === "kwh" ? "Consumption" : "Peak demand"} over the last 30 days. Use View data for exact values.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={daily}
                    margin={{ top: 14, right: 0, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid
                      stroke="var(--ops-line)"
                      strokeDasharray="3 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      minTickGap={40}
                      tick={{ fill: "var(--ops-muted)", fontSize: 12 }}
                      dy={8}
                    />
                    <YAxis
                      tickFormatter={compact}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--ops-muted)", fontSize: 12 }}
                      width={60}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--ops-hover)" }}
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className="ops-chart-tooltip">
                            <span>{label}</span>
                            <strong>
                              {num(Number(payload[0].value))} {chartUnit}
                            </strong>
                          </div>
                        ) : null
                      }
                    />
                    <Bar
                      dataKey={chartKey}
                      fill="var(--ops-chart)"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={22}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="ops-energy-footer">
            <span>
              <i className="ops-legend" />
              {measure === "kwh" ? "Daily consumption" : "Daily peak demand"} (
              {chartUnit})
            </span>
            <span>
              {daily[0]?.label} – {daily[daily.length - 1]?.label}
            </span>
          </div>
        </section>
        <section className="ops-ranking">
          <SectionHeader compact className="ops-section-title"
            title="Highest consuming tenants"
            description="This billing period"
          />
          <div className="ops-ranking-label">
            <span>Tenant</span>
            <span>Consumption</span>
          </div>
          <ol>
            {ranking.map((r, index) => (
              <li key={r.tenant.id}>
                <Link to={`/admin/tenants/${r.tenant.id}`}>
                  <span className="ops-rank-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="ops-rank-detail">
                    <div>
                      <span>{r.tenant.name}</span>
                      <strong>
                        {num(r.periodKwh)}
                        <small> kWh</small>
                      </strong>
                    </div>
                    <div className="ops-rank-track">
                      <i
                        style={{
                          width: `${ranking[0]?.periodKwh ? (r.periodKwh / ranking[0].periodKwh) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
          {!ranking.length && (
            <p className="ops-empty">No active tenant readings.</p>
          )}
          <div className="ops-meter-health">
            <div>
              <Gauge size={16} />
              <span>Meter connectivity</span>
              <strong>
                {kpis.metersTotal - kpis.offlineMeters}
                <small> / {kpis.metersTotal}</small>
              </strong>
            </div>
            <Link to="/admin/energy/meters">
              <span className={kpis.offlineMeters ? "ops-danger" : ""}>
                {kpis.offlineMeters} offline meters
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
      <div className="ops-triage-grid">
        <section className="ops-attention">
          <SectionHeader compact className="ops-section-title"
            title="Operational attention"
            description="Prioritized exceptions across the park"
          >
            <span className="ops-count">{attention.length} to review</span>
          </SectionHeader>
          <div className="ops-queue-toolbar">
            <Tabs
              value={queueFilter}
              onValueChange={(v) => {
                setQueueFilter(v);
                setShowAll(false);
              }}
            >
              <TabsList
                className="ops-filter-tabs"
                aria-label="Attention filter"
              >
                <TabsTrigger
                  value="all"
                  id="attention-tab-all"
                  aria-controls="attention-panel"
                >
                  All items <span>{attention.length}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="critical"
                  id="attention-tab-critical"
                  aria-controls="attention-panel"
                >
                  Critical & offline
                </TabsTrigger>
                <TabsTrigger
                  value="other"
                  id="attention-tab-other"
                  aria-controls="attention-panel"
                >
                  Other alerts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div
            id="attention-panel"
            role="tabpanel"
            aria-labelledby={`attention-tab-${queueFilter}`}
            tabIndex={0}
          >
            <Table
              className="ops-attention-table"
              aria-label="Operational attention"
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Issue / tenant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        className="ops-issue"
                        to={item.href}
                        title={`${item.title} — ${item.tenant} · ${item.detail} · ${ago(item.ts)}`}
                      >
                        <item.icon size={16} />
                        <div>
                          <strong>{item.title}</strong>
                          <span>
                            {item.tenant} <b>·</b> {item.detail}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {item.id.startsWith('req-') ? <PriorityBadge priority="critical" size="sm" /> : item.id.startsWith('mtr-') ? <MeterStatusBadge status="offline" size="sm" /> : item.id.startsWith('vis-') ? <VisitorStatusBadge status="overstaying" size="sm" /> : <AlertSeverityBadge severity={item.tag === 'Critical' ? 'critical' : 'warning'} size="sm" />}
                    </TableCell>
                    <TableCell className="ops-nowrap">{ago(item.ts)}</TableCell>
                    <TableCell>
                      <Link
                        to={item.href}
                        className="ops-row-action"
                        aria-label={`Review ${item.title}`}
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!queue.length && (
              <div className="ops-empty">
                <CheckCheck size={24} />
                <p>No items need attention in this view.</p>
              </div>
            )}
          </div>
          <div className="ops-table-footer">
            <span>
              Showing {queue.length} of {selectedAttention.length} prioritized
              items
            </span>
            {selectedAttention.length > 5 && (
              <button
                className="ops-text-button"
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "Show fewer" : "View all items"}
                <ArrowDownRight size={14} />
              </button>
            )}
          </div>
        </section>
        <section className="ops-arrivals">
          <SectionHeader compact className="ops-section-title"
            title="Upcoming visitors"
            description="Next scheduled arrivals"
          >
            <TextLink to="/admin/visitors/scheduled">All</TextLink>
          </SectionHeader>
          <Link to="/admin/visitors/overstaying" className="ops-overstay">
            <AlarmClock size={16} />
            <span>
              <strong>{kpis.visitorsOverstaying}</strong> overstaying
              {kpis.visitorsOverstaying
                ? " · Review departures"
                : " · All clear"}
            </span>
            <ArrowUpRight size={15} />
          </Link>
          <ul>
            {upcoming.map((v) => (
              <li key={v.id}>
                <div className="ops-avatar">
                  {v.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <strong>{v.fullName}</strong>
                  <span>{v.company || v.purpose}</span>
                </div>
                <time dateTime={new Date(v.expectedArrival).toISOString()}>
                  <span>
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                    }).format(v.expectedArrival)}
                  </span>
                  {fmtTime(v.expectedArrival)}
                </time>
              </li>
            ))}
          </ul>
          {!upcoming.length && (
            <p className="ops-empty">No upcoming visitors.</p>
          )}
        </section>
      </div>
      <div className="ops-bottom-grid">
        <section className="ops-onboarding">
          <SectionHeader compact className="ops-section-title"
            title="Recent onboarding"
            description="Newest organizations in your park"
          >
            <TextLink to="/admin/tenants">All tenants</TextLink>
          </SectionHeader>
          <Table aria-label="Recent onboarding">
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTenants.map((r) => (
                <TableRow key={r.tenant.id}>
                  <TableCell>
                    <Link
                      className="ops-tenant-link"
                      to={`/admin/tenants/${r.tenant.id}`}
                    >
                      <span className="ops-avatar">
                        {r.tenant.code.slice(0, 2)}
                      </span>
                      <strong>{r.tenant.name}</strong>
                    </Link>
                  </TableCell>
                  <TableCell>{r.buildingName}</TableCell>
                  <TableCell>
                    <TenantStatusBadge status={r.tenant.status} size="sm" />
                  </TableCell>
                  <TableCell className="ops-nowrap">
                    {ago(r.tenant.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
        <section className="ops-activity">
          <SectionHeader compact className="ops-section-title"
            title="Recent activity"
            description="Live updates across all tenants"
          />
          <ol>
            {activity.map((a) => {
              const Icon = ACTIVITY_ICON[a.kind] ?? Bell;
              return (
                <li key={a.id}>
                  <span className="ops-activity-icon">
                    <Icon size={15} />
                  </span>
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.detail}</p>
                  </div>
                  <time>{ago(a.ts)}</time>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
      <footer className="ops-page-footer">
        <span>
          <i className="ops-live-dot" />
          Live values update every few seconds
        </span>
        <span>
          {compact(kpis.metersTotal)} meters monitored across the park
        </span>
      </footer>
    </div>
  );
}

/* --------------------------------------------------- attention builder */

interface AttentionItem {
  id: string;
  icon: typeof Zap;
  tone: "critical" | "warning" | "energy" | "visitor" | "service";
  tag: string;
  title: string;
  detail: string;
  tenant: string;
  ts: number;
  href: string;
  rank: number;
}

function buildAttention(w: import("../../data/world").World): AttentionItem[] {
  const items: AttentionItem[] = [];
  const tenantName = (id: string) => w.tenantById[id]?.name ?? "—";

  for (const r of w.requests.filter(
    (x) =>
      x.priority === "critical" &&
      !["closed", "confirmed", "cancelled"].includes(x.status),
  )) {
    items.push({
      id: `req-${r.id}`,
      icon: CATEGORY_ICON[r.category],
      tone: "critical",
      tag: "Critical",
      title: r.title,
      detail: `${r.reference} · ${r.category.replace("_", " ")}`,
      tenant: tenantName(r.tenantId),
      ts: r.updatedAt,
      href: `/admin/service?open=${r.id}`,
      rank: 0,
    });
  }
  for (const v of w.visitors.filter((x) => x.status === "overstaying")) {
    items.push({
      id: `vis-${v.id}`,
      icon: AlarmClock,
      tone: "warning",
      tag: "Overstay",
      title: `${v.fullName} overstaying`,
      detail: v.company ?? v.purpose,
      tenant: tenantName(v.tenantId),
      ts: v.expectedDeparture,
      href: "/admin/visitors/overstaying",
      rank: 1,
    });
  }
  for (const m of w.meters.filter(
    (x) => x.status === "offline" && x.tenantId,
  )) {
    items.push({
      id: `mtr-${m.id}`,
      icon: Gauge,
      tone: "critical",
      tag: "Offline",
      title: `${m.name} offline`,
      detail: `Serial ${m.serial}`,
      tenant: tenantName(m.tenantId!),
      ts: m.lastReadingAt,
      href: "/admin/energy/meters",
      rank: 0,
    });
  }
  for (const a of w.alerts.filter(
    (x) =>
      x.status === "active" &&
      (x.severity === "warning" || x.severity === "critical") &&
      x.kind !== "meter_offline",
  )) {
    items.push({
      id: `al-${a.id}`,
      icon: Zap,
      tone: "energy",
      tag: a.severity === "critical" ? "Critical" : "High",
      title: a.title,
      detail: a.description,
      tenant: tenantName(a.tenantId),
      ts: a.ts,
      href: "/admin/energy/alerts",
      rank: 2,
    });
  }
  return items.sort((a, b) => a.rank - b.rank || b.ts - a.ts).slice(0, 12);
}
