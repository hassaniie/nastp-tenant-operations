/**
 * The NASTP Admin shell.
 *
 * Scoped to the admin experience: `Shell.tsx` still renders the Tenant Portal
 * unchanged, so this moves one experience and leaves the other two alone.
 *
 * The composition, not just the paint:
 *   • Search lives in the rail, directly under the workspace switcher, rather
 *     than floating in the top bar. It is a permanent affordance where the eye
 *     already is, and it frees the bar to be a context strip instead of a
 *     mixed utility tray.
 *   • The bar is therefore slim: breadcrumb on the left, utilities on the
 *     right, nothing competing in the middle.
 *   • Navigation rows are 14px on a 34px row. The previous 13px-on-30px was
 *     dense for the sake of density; this reads at a glance without shouting.
 *   • Group labels drop the wide uppercase tracking — separation comes from
 *     spacing and a hairline, which is quieter and needs no decoration.
 *   • Only problems get a Badge. Volume counts (open requests, unread
 *     notifications) render as plain muted numerals, so a red pill in the rail
 *     always means something is wrong.
 *
 * Behaviour is unchanged: same `matchNav` resolution, same badge counts, same
 * collapse and drawer state, same palette, toaster and idle monitor. No
 * destination, guard or permission is touched.
 */

import { ChevronsLeft, ChevronsRight, Menu, Moon, Search, Sun, X } from 'lucide-react';
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
import { Toaster } from '../components/ui/toast';
import { NotificationBell } from './NotificationBell';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import { UserMenu } from './UserMenu';
import { CommandPalette } from './CommandPalette';
import { IdleMonitor } from './IdleMonitor';

type Badges = { alerts: number; overstaying: number; openRequests: number; notifications: number };

/** Unchanged — the admin scope of the same counts. */
function computeBadges(w: World): Badges {
  return {
    alerts: w.alerts.filter((a) => a.status === 'active').length,
    overstaying: w.visitors.filter((v) => v.status === 'overstaying').length,
    openRequests: w.requests.filter((r) => !['closed', 'confirmed', 'cancelled'].includes(r.status)).length,
    notifications: w.notifications.filter((n) => !n.read).length,
  };
}

/** Only a genuine problem earns colour in the rail. */
const IS_PROBLEM: Record<string, boolean> = { alerts: true, overstaying: true, openRequests: false, notifications: false };

function Rail({
  groups, badges, activeId, collapsed, onToggle, onNavigate, mobile,
}: {
  groups: NavGroup[]; badges: Badges; activeId?: string; collapsed: boolean;
  onToggle: () => void; onNavigate?: () => void; mobile?: boolean;
}) {
  const { setPaletteOpen } = useSession();

  return (
    <nav
      className={cn(
        'flex h-full flex-col border-r border-border bg-background transition-[width] duration-200 ease-out',
        collapsed ? 'w-[72px]' : 'w-[248px]',
      )}
      aria-label="Primary"
    >
      {/* workspace */}
      <div className={cn('flex items-center gap-2 px-3 pb-2 pt-3', collapsed && 'justify-center px-2')}>
        <div className={cn('flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1.5', collapsed && 'flex-none px-0')}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
              <path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-foreground">NASTP</p>
              <p className="truncate text-[12px] text-muted-foreground">Tenant Operations</p>
            </div>
          )}
        </div>
        {!mobile && !collapsed && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-7 w-7 shrink-0 text-muted-foreground" aria-label="Collapse navigation">
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* search — a permanent affordance in the rail, not a top-bar guest */}
      <div className={cn('px-3 pb-3', collapsed && 'px-2')}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} className="h-9 w-full text-muted-foreground" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Search · ⌘K</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 text-[13.5px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search</span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground/70">⌘K</span>
          </button>
        )}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className={cn('px-3 pb-4', collapsed && 'px-2')}>
          {groups.map((group, gi) => (
            <div key={group.id} className={cn(gi > 0 && 'mt-1.5 border-t border-border/70 pt-3')}>
              {!collapsed && group.label && (
                <p className="px-2 pb-1.5 text-[11.5px] font-medium text-muted-foreground/75">{group.label}</p>
              )}
              <ul className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const badge = item.badge ? badges[item.badge] : 0;
                  // Active state comes from the centralized matcher, not from each
                  // link's own `end` rule — that is what keeps nested/detail routes
                  // (e.g. /admin/tenants/:id) lit under their parent module.
                  const active = item.id === activeId;
                  const problem = item.badge ? IS_PROBLEM[item.badge] : false;
                  const link = (
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-[14px] transition-colors duration-100',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-accent font-medium text-foreground'
                          : 'font-normal text-muted-foreground hover:bg-accent/55 hover:text-foreground',
                      )}
                    >
                      <item.icon className={cn('h-[17px] w-[17px] shrink-0', active ? 'text-primary' : 'text-muted-foreground/80')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && badge > 0 && (
                        problem ? (
                          <Badge variant="destructive-light" size="xs" className="ml-auto tabular-nums">{badge}</Badge>
                        ) : (
                          <span className="ml-auto text-[12.5px] tabular-nums text-muted-foreground/70">{badge}</span>
                        )
                      )}
                      {collapsed && badge > 0 && problem && (
                        <span aria-hidden className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
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

/** A context strip. Location on the left, utilities on the right, nothing in
 *  the middle competing with either. */
function ContextBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { prefs, setPrefs } = useSession();
  const location = useLocation();
  const match = matchNav(ADMIN_NAV, location.pathname);
  const section = match?.group.label;
  // On a nested/detail route the leaf label ('All Tenants') would misdescribe
  // the page, so surface the module instead — the page's own header carries
  // the specific title.
  const title = match ? (match.nested && match.group.label ? match.group.label : match.leaf.label) : 'Admin';

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-border bg-background px-3 lg:px-6">
      <Button variant="ghost" size="icon" onClick={onOpenMobileNav} className="h-8 w-8 lg:hidden" aria-label="Open navigation">
        <Menu className="h-[18px] w-[18px]" />
      </Button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        <span className="hidden shrink-0 text-muted-foreground/70 sm:inline">NASTP</span>
        <span className="hidden text-muted-foreground/40 sm:inline">/</span>
        {section && section !== title && (
          <>
            <span className="hidden truncate text-muted-foreground/70 md:inline">{section}</span>
            <span className="hidden text-muted-foreground/40 md:inline">/</span>
          </>
        )}
        <span className="truncate font-medium text-foreground">{title}</span>
      </nav>

      <div className="flex shrink-0 items-center gap-0.5">
        <NotificationBell />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
              aria-label="Toggle theme"
            >
              {prefs.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Switch to {prefs.theme === 'dark' ? 'light' : 'dark'} theme</TooltipContent>
        </Tooltip>
        <div className="mx-2 h-5 w-px bg-border" />
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
          <Rail groups={ADMIN_NAV} badges={badges} activeId={activeId} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        </div>

        {mobileNav && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-[fade-in_0.16s_ease-out]" onClick={() => setMobileNav(false)} />
            <div className="absolute inset-y-0 left-0 animate-[slide-in_0.24s_cubic-bezier(0.22,1,0.36,1)]">
              <Rail
                groups={ADMIN_NAV} badges={badges} activeId={activeId} collapsed={false}
                onToggle={() => setMobileNav(false)} onNavigate={() => setMobileNav(false)} mobile
              />
            </div>
            <button onClick={() => setMobileNav(false)} className="absolute right-3 top-3 rounded-lg bg-card p-2 text-muted-foreground" aria-label="Close navigation">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <ContextBar onOpenMobileNav={() => setMobileNav(true)} />
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
