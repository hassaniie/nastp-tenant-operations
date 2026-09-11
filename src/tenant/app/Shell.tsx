/**
 * The application shell for both experiences.
 *
 * A grouped rail (deep for admin, shallow for the portal), a top bar carrying
 * search, notifications, the experience switch and the theme toggle, and the
 * global surfaces (command palette, toasts). The portal rail is branded with
 * the tenant's own mark so a tenant always knows whose workspace they are in.
 */

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLive } from '../data/live';
import type { World } from '../data/world';
import { useSession } from '../store/session';
import { ADMIN_NAV, PORTAL_NAV, matchNav } from './nav';
import { Button } from '../components/ui/button';
import { Kbd } from '../components/ui/kbd';
import { TenantMark } from '../components/ui/avatar';
import { Tooltip, TooltipProvider } from '../components/ui/tooltip';
import { Toaster } from '../components/ui/toast';
import { NotificationBell } from './NotificationBell';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { UserMenu } from './UserMenu';
import { CommandPalette } from './CommandPalette';
import { IdleMonitor } from './IdleMonitor';
import { AdminSidebar } from '../components/patterns/admin-sidebar';
import { Breadcrumb } from '../components/patterns/breadcrumb';
import { WorkspaceSidebar } from '../components/patterns/workspace-sidebar';
import { AppMain, AppShellColumn, AppShellFrame, AppTopbar } from '../components/layout/app-shell';
import '../styles/admin-workspace.css';

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
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-[var(--brand-mark-end)] shadow-[var(--brand-mark-shadow)]">
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden>
          <path d="M4 20V9l8-5 8 5v11" stroke="var(--brand-mark-foreground)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 20v-6h6v6" stroke="var(--brand-mark-foreground)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { experience, tenantId, prefs, setPrefs, setPaletteOpen } = useSession();
  const location = useLocation();
  const groups = experience === 'admin' ? ADMIN_NAV : PORTAL_NAV;
  const match = matchNav(groups, location.pathname);
  // On a nested/detail route the leaf label ('All Tenants') would misdescribe
  // the page, so surface the module instead — the page's own header carries
  // the specific title.
  const title = match ? (match.nested && match.group.label ? match.group.label : match.leaf.label) : undefined;
  const adminBreadcrumb = (() => {
    if (import.meta.env.DEV && location.pathname === '/admin/design-system') return [{ label: 'Workspace', to: '/admin' }, { label: 'Design system' }];
    if (!match) return [{ label: 'Workspace', to: '/admin' }, { label: 'NASTP Admin' }];
    if (match.group.id === 'overview') return [{ label: 'Workspace', to: '/admin' }, { label: 'Dashboard' }];
    if (match.nested) return [{ label: 'Workspace', to: '/admin' }, { label: match.group.label ?? match.leaf.label }];
    return [
      { label: 'Workspace', to: '/admin' },
      { label: match.group.label ?? match.leaf.label, to: match.group.items[0].path },
      { label: match.leaf.label },
    ];
  })();

  return (
    <AppTopbar className="ops-topbar">
      <button onClick={onOpenMobileNav} className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-raised hover:text-foreground lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        {experience === 'admin' ? (
          <div className="truncate text-[15px] font-semibold tracking-[-0.015em] text-foreground">
            <span className="ops-mobile-title">NASTP</span>
            <Breadcrumb className="ops-header-title ops-topbar-breadcrumb" items={adminBreadcrumb} />
          </div>
        ) : <h1 className="truncate text-[15px] font-semibold tracking-[-0.015em] text-foreground">{title ?? 'Tenant Portal'}</h1>}
      </div>

      {experience === 'admin' && <button onClick={() => setPaletteOpen(true)} className="rounded-md p-2 text-muted md:hidden" aria-label="Search workspace"><Search className="h-4 w-4" /></button>}
      <button
        onClick={() => setPaletteOpen(true)}
        className="ops-search hidden h-9 items-center gap-2 rounded-[10px] border border-border bg-surface-inset px-3 text-[13px] text-subtle transition-colors hover:border-border-strong hover:text-muted md:flex md:w-[240px] xl:w-[300px]"
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

        <div className="ops-account ml-1 hidden border-l border-border pl-2 lg:block">
          <UserMenu />
        </div>
      </div>
    </AppTopbar>
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

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setMobileNav(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <TooltipProvider delayDuration={220} skipDelayDuration={400}>
      <AppShellFrame className={cn(experience === 'admin' && 'ops-shell')}>
        <div className="hidden lg:block">
          {experience === 'admin' ? <AdminSidebar badges={badges} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} /> : <WorkspaceSidebar groups={groups} badges={badges} activeId={activeId} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} header={<Brand collapsed={collapsed} />} />}
        </div>

        {experience === 'admin' && (
          <DialogPrimitive.Root open={mobileNav} onOpenChange={setMobileNav}>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/60 lg:hidden" />
              <DialogPrimitive.Content
                aria-describedby={undefined}
                onCloseAutoFocus={(event) => {
                  event.preventDefault();
                  document.querySelector<HTMLButtonElement>('[aria-label="Open navigation"]')?.focus();
                }}
                className="ops-shell fixed inset-y-0 left-0 z-[71] outline-none lg:hidden"
              >
                <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
                <AdminSidebar badges={badges} collapsed={false} onToggle={() => setMobileNav(false)} onNavigate={() => setMobileNav(false)} mobile />
                <DialogPrimitive.Close className="absolute right-2 top-2 rounded-md p-2 text-[var(--ops-muted)]" aria-label="Close navigation">
                  <X className="h-4 w-4" />
                </DialogPrimitive.Close>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        )}
        {experience === 'portal' && mobileNav && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-[fade-in_0.16s_ease-out]" onClick={() => setMobileNav(false)} />
            <div className="absolute inset-y-0 left-0 animate-[slide-in_0.24s_cubic-bezier(0.22,1,0.36,1)]">
              <WorkspaceSidebar groups={groups} badges={badges} activeId={activeId} collapsed={false} onToggle={() => setMobileNav(false)} onNavigate={() => setMobileNav(false)} mobile header={<Brand collapsed={false} />} />
            </div>
            <button onClick={() => setMobileNav(false)} className="absolute right-3 top-3 rounded-lg bg-surface-raised p-2 text-muted" aria-label="Close navigation">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <AppShellColumn>
          <TopBar onOpenMobileNav={() => setMobileNav(true)} />
          <AppMain><Outlet /></AppMain>
        </AppShellColumn>

        <CommandPalette />
        <Toaster />
        <IdleMonitor />
      </AppShellFrame>
    </TooltipProvider>
  );
}

export function AdminShell() {
  return <Shell experience="admin" />;
}

export function PortalShell(): ReactNode {
  return <Shell experience="portal" />;
}
