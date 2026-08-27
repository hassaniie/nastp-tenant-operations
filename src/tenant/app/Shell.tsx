/**
 * The application shell for both experiences.
 *
 * A grouped rail (deep for admin, shallow for the portal), a top bar carrying
 * search, notifications, the experience switch and the theme toggle, and the
 * global surfaces (command palette, toasts). The portal rail is branded with
 * the tenant's own mark so a tenant always knows whose workspace they are in.
 */

import { ChevronsLeft, ChevronsRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLive } from '../data/live';
import type { World } from '../data/world';
import { useSession } from '../store/session';
import { ADMIN_NAV, PORTAL_NAV, matchNav, type NavGroup } from './nav';
import { Button, Kbd, TenantMark } from '../components/ui/primitives';
import { Tooltip, TooltipProvider } from '../components/ui/overlay';
import { Toaster } from '../components/ui/toast';
import { NotificationBell } from './NotificationBell';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { CommandPalette } from './CommandPalette';

type Badges = { alerts: number; overstaying: number; openRequests: number; notifications: number };

function computeBadges(w: World, experience: 'admin' | 'portal', tenantId: string): Badges {
  if (experience === 'portal') {
    return {
      alerts: w.alerts.filter((a) => a.tenantId === tenantId && a.status === 'active').length,
      overstaying: w.visitors.filter((v) => v.tenantId === tenantId && v.status === 'overstaying').length,
      openRequests: w.requests.filter((r) => r.tenantId === tenantId && !['closed', 'confirmed', 'cancelled'].includes(r.status)).length,
      notifications: w.notifications.filter((n) => n.tenantId === tenantId && !n.read).length,
    };
  }
  return {
    alerts: w.alerts.filter((a) => a.status === 'active').length,
    overstaying: w.visitors.filter((v) => v.status === 'overstaying').length,
    openRequests: w.requests.filter((r) => !['closed', 'confirmed', 'cancelled'].includes(r.status)).length,
    notifications: w.notifications.filter((n) => !n.read).length,
  };
}

function Brand({ collapsed }: { collapsed: boolean }) {
  const { experience, tenantId } = useSession();
  const tenant = useLive((w) => w.tenantById[tenantId]);

  if (experience === 'portal' && tenant) {
    return (
      <div className={cn('flex items-center gap-2.5 px-3', collapsed && 'justify-center px-0')}>
        <TenantMark name={tenant.name} hue={tenant.brandHue} size={34} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-[-0.015em] text-foreground">{tenant.name}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.12em] text-subtle">Tenant Portal</p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={cn('flex items-center gap-2.5 px-3', collapsed && 'justify-center px-0')}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-[#4338ca] shadow-[0_2px_10px_rgba(99,102,241,0.35)]">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
          <path d="M4 20V9l8-5 8 5v11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 20v-6h6v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold tracking-[-0.015em] text-foreground">NASTP</p>
          <p className="truncate text-[11px] uppercase tracking-[0.12em] text-subtle">Tenant Operations</p>
        </div>
      )}
    </div>
  );
}

function Rail({ groups, badges, activeId, collapsed, onToggle, onNavigate, mobile }: { groups: NavGroup[]; badges: Badges; activeId?: string; collapsed: boolean; onToggle: () => void; onNavigate?: () => void; mobile?: boolean }) {
  return (
    <nav className={cn('flex h-full flex-col border-r border-border bg-background transition-[width] duration-200 ease-out', collapsed ? 'w-[68px]' : 'w-[244px]')} aria-label="Primary">
      <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-border">
        <Brand collapsed={collapsed} />
        {!mobile && !collapsed && (
          <button onClick={onToggle} className="mr-2 rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-raised hover:text-foreground" aria-label="Collapse navigation">
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
        {groups.map((group) => (
          <div key={group.id} className="mb-4 last:mb-0">
            {!collapsed && group.label && <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">{group.label}</p>}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const badge = item.badge ? badges[item.badge] : 0;
                // Active state comes from the centralized matcher, not from each
                // link's own `end` rule — that is what keeps nested/detail routes
                // (e.g. /admin/tenants/:id) lit under their parent module.
                const active = item.id === activeId;
                const link = (
                  <Link
                    to={item.path}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
                      collapsed && 'justify-center px-0',
                      active ? 'bg-primary-muted text-foreground' : 'text-muted hover:bg-surface-raised hover:text-foreground',
                    )}
                  >
                    {active && <span className="absolute inset-y-1.5 left-0 w-[2.5px] rounded-full bg-primary" aria-hidden />}
                    <item.icon className={cn('h-4.5 w-4.5 shrink-0', active && 'text-primary')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {badge > 0 && (
                      <span className={cn('tnum ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-semibold', item.badge === 'alerts' || item.badge === 'overstaying' ? 'bg-critical text-white' : 'bg-surface-inset text-muted', collapsed && 'absolute right-1 top-1 ml-0 h-[17px] min-w-[17px] text-[11px]')}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
                return <li key={item.id}>{collapsed ? <Tooltip side="right" content={item.label}>{link}</Tooltip> : link}</li>;
              })}
            </ul>
          </div>
        ))}
      </div>

      {collapsed && !mobile && (
        <div className="shrink-0 border-t border-border p-2.5">
          <button onClick={onToggle} className="flex w-full items-center justify-center rounded-lg py-2 text-subtle transition-colors hover:bg-surface-raised hover:text-foreground" aria-label="Expand navigation">
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  );
}

function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { experience, tenantId, prefs, setPrefs, setPaletteOpen, admin } = useSession();
  const location = useLocation();
  const groups = experience === 'admin' ? ADMIN_NAV : PORTAL_NAV;
  const match = matchNav(groups, location.pathname);
  // On a nested/detail route the leaf label ('All Tenants') would misdescribe
  // the page, so surface the module instead — the page's own header carries
  // the specific title.
  const title = match ? (match.nested && match.group.label ? match.group.label : match.leaf.label) : undefined;

  return (
    <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-border bg-background px-3 lg:px-5">
      <button onClick={onOpenMobileNav} className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-raised hover:text-foreground lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-semibold tracking-[-0.015em] text-foreground">{title ?? (experience === 'admin' ? 'NASTP Admin' : 'Tenant Portal')}</h1>
      </div>

      <button
        onClick={() => setPaletteOpen(true)}
        className="hidden h-9 items-center gap-2 rounded-[10px] border border-border bg-surface-inset px-3 text-[13px] text-subtle transition-colors hover:border-border-strong hover:text-muted md:flex md:w-[240px] xl:w-[300px]"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <Kbd>⌘K</Kbd>
      </button>

      <div className="flex items-center gap-1.5">
        <NotificationBell tenantId={experience === 'portal' ? tenantId : undefined} />
        <Tooltip content={`Switch to ${prefs.theme === 'dark' ? 'light' : 'dark'} theme`}>
          <Button variant="ghost" size="icon-sm" onClick={() => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })} aria-label="Toggle theme">
            {prefs.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </Tooltip>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <ExperienceSwitcher />

        {experience === 'admin' && (
          <div className="ml-1 hidden items-center gap-2 border-l border-border pl-3 lg:flex">
            <div className="text-right">
              <p className="text-[12px] font-medium leading-tight text-foreground">{admin.name}</p>
              <p className="text-[11px] leading-tight text-subtle">{admin.role}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#312e81] text-[11px] font-semibold text-white">AR</span>
          </div>
        )}
      </div>
    </header>
  );
}

export function Shell({ experience }: { experience: 'admin' | 'portal' }) {
  const { tenantId } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();
  const groups = experience === 'admin' ? ADMIN_NAV : PORTAL_NAV;
  const badges = useLive((w) => computeBadges(w, experience, tenantId));
  const activeId = matchNav(groups, location.pathname)?.leaf.id;

  useEffect(() => {
    setMobileNav(false);
    document.getElementById('main-scroll')?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <TooltipProvider delayDuration={220} skipDelayDuration={400}>
      <div className={cn('flex h-full w-full overflow-hidden bg-canvas')}>
        <div className="hidden lg:block">
          <Rail groups={groups} badges={badges} activeId={activeId} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>

        {mobileNav && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-[fade-in_0.16s_ease-out]" onClick={() => setMobileNav(false)} />
            <div className="absolute inset-y-0 left-0 animate-[slide-in_0.24s_cubic-bezier(0.22,1,0.36,1)]">
              <Rail groups={groups} badges={badges} activeId={activeId} collapsed={false} onToggle={() => setMobileNav(false)} onNavigate={() => setMobileNav(false)} mobile />
            </div>
            <button onClick={() => setMobileNav(false)} className="absolute right-3 top-3 rounded-lg bg-surface-raised p-2 text-muted" aria-label="Close navigation">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenMobileNav={() => setMobileNav(true)} />
          <main id="main-scroll" className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>

        <CommandPalette />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export function AdminShell() {
  return <Shell experience="admin" />;
}

export function PortalShell(): ReactNode {
  return <Shell experience="portal" />;
}
