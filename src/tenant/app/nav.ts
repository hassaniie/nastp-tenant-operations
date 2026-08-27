/**
 * Information architecture. Two navigation trees for the two experiences.
 *
 * Admin (§44) is grouped and deep — a control plane. The Tenant Portal (§45) is
 * deliberately shallow: six destinations, with secondary navigation living
 * inside each domain page rather than in the rail.
 */

import {
  AlarmClock, BadgePercent, BarChart3, Bell, Building2, CalendarClock, DoorOpen, FileBarChart,
  Gauge, History, LayoutDashboard, Settings, UserPlus, UserRound, Users,
  Wallet, Wrench, Zap, type LucideIcon,
} from 'lucide-react';

export interface NavLeaf {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** Which KPI count to badge, if any. */
  badge?: 'alerts' | 'overstaying' | 'openRequests' | 'notifications';
  end?: boolean;
}

export interface NavGroup {
  id: string;
  label?: string;
  items: NavLeaf[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    id: 'overview',
    items: [{ id: 'dashboard', label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    id: 'tenants',
    label: 'Tenants',
    items: [
      { id: 'all-tenants', label: 'All Tenants', path: '/admin/tenants', icon: Building2, end: true },
      { id: 'onboarding', label: 'Onboarding', path: '/admin/tenants/new', icon: UserPlus },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    items: [
      { id: 'energy-overview', label: 'Overview', path: '/admin/energy', icon: Zap, end: true },
      { id: 'energy-consumption', label: 'Tenant Consumption', path: '/admin/energy/consumption', icon: BarChart3 },
      { id: 'energy-meters', label: 'Meters', path: '/admin/energy/meters', icon: Gauge },
      { id: 'energy-tariffs', label: 'Tariffs & Rates', path: '/admin/energy/tariffs', icon: BadgePercent },
      { id: 'energy-billing', label: 'Charges & Billing', path: '/admin/energy/billing', icon: Wallet },
      { id: 'energy-alerts', label: 'Alerts', path: '/admin/energy/alerts', icon: Bell, badge: 'alerts' },
    ],
  },
  {
    id: 'visitors',
    label: 'Visitors',
    items: [
      { id: 'visitors-overview', label: 'Overview', path: '/admin/visitors', icon: UserRound, end: true },
      { id: 'visitors-scheduled', label: 'Scheduled', path: '/admin/visitors/scheduled', icon: CalendarClock },
      { id: 'visitors-inside', label: 'In Building', path: '/admin/visitors/inside', icon: DoorOpen },
      { id: 'visitors-overstaying', label: 'Overstaying', path: '/admin/visitors/overstaying', icon: AlarmClock, badge: 'overstaying' },
      { id: 'visitors-history', label: 'History', path: '/admin/visitors/history', icon: History },
    ],
  },
  {
    id: 'service',
    label: 'Service Center',
    items: [
      { id: 'service-requests', label: 'Requests', path: '/admin/service', icon: Wrench, end: true, badge: 'openRequests' },
      { id: 'service-board', label: 'Board', path: '/admin/service/board', icon: LayoutDashboard },
      { id: 'service-performance', label: 'Performance', path: '/admin/service/performance', icon: BarChart3 },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'reports', label: 'Reports', path: '/admin/reports', icon: FileBarChart },
      { id: 'notifications', label: 'Notifications', path: '/admin/notifications', icon: Bell, badge: 'notifications' },
      { id: 'admin-buildings', label: 'Buildings & Spaces', path: '/admin/settings/buildings', icon: Building2 },
      { id: 'admin-users', label: 'Users', path: '/admin/settings/users', icon: Users },
      { id: 'admin-settings', label: 'Settings', path: '/admin/settings', icon: Settings, end: true },
    ],
  },
];

export const PORTAL_NAV: NavGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Home', path: '/portal', icon: LayoutDashboard, end: true },
      { id: 'energy', label: 'Energy', path: '/portal/energy', icon: Zap },
      { id: 'visitors', label: 'Visitors', path: '/portal/visitors', icon: UserRound },
      { id: 'service', label: 'Service Center', path: '/portal/service', icon: Wrench, badge: 'openRequests' },
      { id: 'notifications', label: 'Notifications', path: '/portal/notifications', icon: Bell, badge: 'notifications' },
      { id: 'organization', label: 'Organization', path: '/portal/organization', icon: Building2 },
    ],
  },
];

/* Secondary navigation inside each portal domain (§45). */
export const PORTAL_ENERGY_TABS = [
  { id: 'overview', label: 'Overview', path: '/portal/energy' },
  { id: 'consumption', label: 'Consumption', path: '/portal/energy/consumption' },
  { id: 'demand', label: 'Demand & Load', path: '/portal/energy/demand' },
  { id: 'details', label: 'Energy Details', path: '/portal/energy/details' },
  { id: 'billing', label: 'Billing & Charges', path: '/portal/energy/billing' },
  { id: 'alerts', label: 'Alerts', path: '/portal/energy/alerts' },
];

export const PORTAL_VISITOR_TABS = [
  { id: 'upcoming', label: 'Upcoming', path: '/portal/visitors' },
  { id: 'schedule', label: 'Schedule Visitor', path: '/portal/visitors/schedule' },
  { id: 'recurring', label: 'Recurring', path: '/portal/visitors/recurring' },
  { id: 'inside', label: 'Inside', path: '/portal/visitors/inside' },
  { id: 'history', label: 'History', path: '/portal/visitors/history' },
];

export const PORTAL_SERVICE_TABS = [
  { id: 'my-requests', label: 'My Requests', path: '/portal/service' },
  { id: 'new', label: 'New Request', path: '/portal/service/new' },
  { id: 'history', label: 'History', path: '/portal/service/history' },
];

/* ------------------------------------------------------------ route matching */

/** Segment-aware prefix test: "/admin/tenants" matches "/admin/tenants/x"
 *  but never "/admin/tenants-archive". */
const isUnder = (base: string, pathname: string) =>
  pathname === base || pathname.startsWith(base.endsWith('/') ? base : base + '/');

export interface NavMatch {
  leaf: NavLeaf;
  group: NavGroup;
  /** True when the URL is a nested/detail route beneath the leaf rather than
   *  the leaf itself — e.g. /admin/tenants/:id under "All Tenants". */
  nested: boolean;
}

/**
 * The single source of truth for "where am I?" in the navigation tree.
 *
 * Resolution order:
 *   1. The most specific leaf whose own matching rule accepts the path — an
 *      `end` leaf must match exactly, others match themselves or anything under
 *      them. Longest path wins, so /admin/tenants/new beats /admin/tenants.
 *   2. If nothing accepts it, the URL is a nested/detail route (for example
 *      /admin/tenants/:tenantId). Fall back to the deepest ancestor leaf so the
 *      parent module stays lit and the user keeps their context.
 *
 * Because detail pages resolve through step 2, no screen ever needs its own
 * special case, and adding a new nested route requires no navigation change.
 */
export function matchNav(groups: NavGroup[], pathname: string): NavMatch | undefined {
  const entries = groups.flatMap((group) => group.items.map((leaf) => ({ leaf, group })));
  const byDepth = [...entries].sort((a, b) => b.leaf.path.length - a.leaf.path.length);

  const exact = byDepth.find(({ leaf }) => (leaf.end ? pathname === leaf.path : isUnder(leaf.path, pathname)));
  if (exact) return { ...exact, nested: pathname !== exact.leaf.path };

  // Nested/detail route: keep the closest ancestor module active.
  const ancestor = byDepth.find(({ leaf }) => isUnder(leaf.path, pathname));
  return ancestor ? { ...ancestor, nested: true } : undefined;
}

/** Convenience wrapper for callers that only need the active leaf. */
export const findNav = (groups: NavGroup[], pathname: string): NavLeaf | undefined =>
  matchNav(groups, pathname)?.leaf;

/** Active secondary-tab id for the portal's in-page tab bars. */
export const matchTab = <T extends { id: string; path: string }>(tabs: T[], pathname: string): string =>
  ([...tabs].sort((a, b) => b.path.length - a.path.length).find((t) => isUnder(t.path, pathname)) ?? tabs[0]).id;
