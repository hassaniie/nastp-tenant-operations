/**
 * The NASTP Admin shell, rebuilt on the ReUI/shadcn component language.
 *
 * Scoped to the admin experience on purpose: `Shell.tsx` still renders the
 * Tenant Portal exactly as it did, so this pilot changes one experience and
 * leaves the other two untouched.
 *
 * What actually changed, beyond paint:
 *   • The rail is a quiet plane rather than a bordered box. Group labels drop
 *     to a 10px lead-in, items lose their accent bar, and the active row is a
 *     filled `bg-accent` plate — the shadcn/ReUI navigation idiom.
 *   • Counts are real ReUI `Badge`s (`destructive-light` for anything that is
 *     actually wrong, `secondary` for volume), so a number in the rail carries
 *     the same status vocabulary as a number on the page.
 *   • The rail scrolls in a shadcn `ScrollArea`, so long navigation does not
 *     hand the page a second native scrollbar.
 *   • The top bar reads as a location + a command surface: a breadcrumb pair
 *     rather than one bare title, and search promoted to a real control.
 *
 * Behaviour is deliberately identical: the same `matchNav` resolution, the
 * same badge counts, the same collapse and mobile-drawer state, the same
 * command palette, toaster and idle monitor. No navigation destination, guard
 * or permission is touched.
 */

import { ChevronsLeft, ChevronsRight, Menu, Moon, PanelLeft, Search, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLive } from '../data/live';
import type { World } from '../data/world';
import { useSession } from '../store/session';
import { ADMIN_NAV, matchNav, type NavGroup } from './nav';
import { Badge } from '../components/reui/badge';
import { Button } from '../components/shadcn/button';
import { ScrollArea } from '../components/shadcn/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/shadcn/tooltip';
import { Kbd } from '../components/ui/primitives';
import { Toaster } from '../components/ui/toast';
import { NotificationBell } from './NotificationBell';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { UserMenu } from './UserMenu';
import { CommandPalette } from './CommandPalette';
import { IdleMonitor } from './IdleMonitor';

type Badges = { alerts: number; overstaying: number; openRequests: number; notifications: number };

/** Unchanged from Shell.tsx — the admin scope of the same counts. */
function computeBadges(w: World): Badges {
  return {
    alerts: w.alerts.filter((a) => a.status === 'active').length,
    overstaying: w.visitors.filter((v) => v.status === 'overstaying').length,
    openRequests: w.requests.filter((r) => !['closed', 'confirmed', 'cancelled'].includes(r.status)).length,
    notifications: w.notifications.filter((n) => !n.read).length,
  };
}

/** Anything that is actually wrong shouts; volume counts stay quiet. */
const BADGE_VARIANT: Record<string, 'destructive-light' | 'secondary'> = {
  alerts: 'destructive-light',
  overstaying: 'destructive-light',
  openRequests: 'secondary',
  notifications: 'secondary',
};

function Workspace({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', collapsed && 'justify-center')}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
          <path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!collapsed && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground">NASTP</p>
          <p className="truncate text-[11px] text-muted-foreground">Tenant Operations</p>
        </div>
      )}
    </div>
  );
}

function Rail({
  groups, badges, activeId, collapsed, onToggle, onNavigate, mobile,
}: {
  groups: NavGroup[]; badges: Badges; activeId?: string; collapsed: boolean;
  onToggle: () => void; onNavigate?: () => void; mobile?: boolean;
}) {
  return (
    <nav
      className={cn(
        'flex h-full flex-col border-r border-border bg-background transition-[width] duration-200 ease-out',
        collapsed ? 'w-[68px]' : 'w-[252px]',
      )}
      aria-label="Primary"
    >
      <div className={cn('flex h-[60px] shrink-0 items-center gap-2 px-3', collapsed && 'justify-center px-0')}>
        <Workspace collapsed={collapsed} />
        {!mobile && !collapsed && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto h-7 w-7 text-muted-foreground" aria-label="Collapse navigation">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-3 pb-4">
          {groups.map((group) => (
            <div key={group.id} className="mb-5 last:mb-0">
              {!collapsed && group.label && (
                <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              <ul className="flex flex-col gap-[3px]">
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
                        'group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors duration-100',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-accent font-medium text-foreground'
                          : 'font-normal text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                      )}
                    >
                      <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && badge > 0 && item.badge && (
                        <Badge variant={BADGE_VARIANT[item.badge]} size="xs" className="ml-auto tabular-nums">
                          {badge}
                        </Badge>
                      )}
                      {collapsed && badge > 0 && (
                        <span
                          aria-hidden
                          className={cn(
                            'absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full',
                            BADGE_VARIANT[item.badge!] === 'destructive-light' ? 'bg-destructive' : 'bg-muted-foreground',
                          )}
                        />
                      )}
                    </Link>
                  );
                  return (
                    <li key={item.id} className="relative">
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className={cn('shrink-0 border-t border-border p-2.5', collapsed && 'flex justify-center')}>
        {collapsed && !mobile ? (
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 text-muted-foreground" aria-label="Expand navigation">
            <ChevronsRight className="h-4 w-4" />
          </Button>
        ) : (
          <UserMenu />
        )}
      </div>
    </nav>
  );
}

function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { prefs, setPrefs, setPaletteOpen } = useSession();
  const location = useLocation();
  const match = matchNav(ADMIN_NAV, location.pathname);
  // On a nested/detail route the leaf label ('All Tenants') would misdescribe
  // the page, so surface the module instead — the page's own header carries
  // the specific title.
  const section = match?.group.label;
  const title = match ? (match.nested && match.group.label ? match.group.label : match.leaf.label) : 'NASTP Admin';

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-border bg-background px-3 lg:px-5">
      <Button variant="ghost" size="icon" onClick={onOpenMobileNav} className="h-8 w-8 lg:hidden" aria-label="Open navigation">
        <Menu className="h-[18px] w-[18px]" />
      </Button>

      {/* Location, not just a title: the module reads as context and the page
          as the current place — the breadcrumb shape every operations console
          uses to say where you are. */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <PanelLeft className="hidden h-4 w-4 shrink-0 text-muted-foreground/60 sm:block" aria-hidden />
        {section && section !== title && (
          <>
            <span className="hidden truncate text-[13px] text-muted-foreground sm:inline">{section}</span>
            <span className="hidden text-muted-foreground/40 sm:inline">/</span>
          </>
        )}
        <h1 className="truncate text-[13px] font-medium text-foreground">{title}</h1>
      </div>

      <button
        onClick={() => setPaletteOpen(true)}
        className="hidden h-8 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground md:flex md:w-[220px] xl:w-[280px]"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <Kbd>⌘K</Kbd>
      </button>

      <div className="flex items-center gap-1">
        <NotificationBell />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
              aria-label="Toggle theme"
            >
              {prefs.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Switch to {prefs.theme === 'dark' ? 'light' : 'dark'} theme</TooltipContent>
        </Tooltip>
        <div className="mx-1.5 hidden h-5 w-px bg-border sm:block" />
        <ExperienceSwitcher />
      </div>
    </header>
  );
}

export function AdminShellNext() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();
  const badges = useLive(computeBadges);
  const activeId = matchNav(ADMIN_NAV, location.pathname)?.leaf.id;

  useEffect(() => {
    setMobileNav(false);
    document.getElementById('main-scroll')?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <TooltipProvider delayDuration={220} skipDelayDuration={400}>
      <div className="flex h-full w-full overflow-hidden bg-canvas">
        <div className="hidden lg:block">
          <Rail
            groups={ADMIN_NAV}
            badges={badges}
            activeId={activeId}
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
          />
        </div>

        {mobileNav && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-[fade-in_0.16s_ease-out]"
              onClick={() => setMobileNav(false)}
            />
            <div className="absolute inset-y-0 left-0 animate-[slide-in_0.24s_cubic-bezier(0.22,1,0.36,1)]">
              <Rail
                groups={ADMIN_NAV}
                badges={badges}
                activeId={activeId}
                collapsed={false}
                onToggle={() => setMobileNav(false)}
                onNavigate={() => setMobileNav(false)}
                mobile
              />
            </div>
            <button
              onClick={() => setMobileNav(false)}
              className="absolute right-3 top-3 rounded-lg bg-card p-2 text-muted-foreground"
              aria-label="Close navigation"
            >
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
        <IdleMonitor />
      </div>
    </TooltipProvider>
  );
}
