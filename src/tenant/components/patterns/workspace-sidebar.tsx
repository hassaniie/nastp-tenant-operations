import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { NavGroup } from '../../app/nav';
import { cn } from '../../lib/utils';
import { IconButton } from '../ui/button';
import { Tooltip } from '../ui/tooltip';

type Badges = Record<'alerts' | 'overstaying' | 'openRequests' | 'notifications', number>;

/** Compact sidebar for shallow workspaces such as the Tenant Portal. */
export function WorkspaceSidebar({ groups, badges, activeId, collapsed, onToggle, onNavigate, mobile, header }: {
  groups: NavGroup[];
  badges: Badges;
  activeId?: string;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
  header: ReactNode;
}) {
  return (
    <nav className={cn('ds-sidebar flex h-full flex-col border-r border-border bg-background transition-[width] duration-200 ease-out', collapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]')} aria-label="Primary">
      <div className="flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-border">
        {header}
        {!mobile && !collapsed && <IconButton label="Collapse navigation" size="sm" variant="ghost" className="mr-2" onClick={onToggle}><ChevronsLeft /></IconButton>}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
        {groups.map((group) => (
          <div key={group.id} className="mb-4 last:mb-0">
            {!collapsed && group.label && <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">{group.label}</p>}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const badge = item.badge ? badges[item.badge] : 0;
                const active = item.id === activeId;
                const link = (
                  <Link to={item.path} onClick={onNavigate} aria-current={active ? 'page' : undefined}
                    className={cn('group relative flex min-h-[var(--control-height-md)] items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 text-[13px] font-medium transition-colors', collapsed && 'justify-center px-0', active ? 'bg-primary-muted text-foreground' : 'text-muted hover:bg-surface-raised hover:text-foreground')}>
                    {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" aria-hidden />}
                    <item.icon className={cn('size-[var(--icon-md)] shrink-0', active && 'text-primary')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {badge > 0 && <span className={cn('tnum ml-auto min-w-[18px] rounded-full bg-surface-inset px-1 text-center text-[11px] font-semibold text-muted', collapsed && 'absolute right-1 top-1 ml-0')}>{badge}</span>}
                  </Link>
                );
                return <li key={item.id}>{collapsed ? <Tooltip side="right" content={item.label}>{link}</Tooltip> : link}</li>;
              })}
            </ul>
          </div>
        ))}
      </div>
      {collapsed && !mobile && <div className="shrink-0 border-t border-border p-2.5"><IconButton label="Expand navigation" variant="ghost" className="w-full" onClick={onToggle}><ChevronsRight /></IconButton></div>}
    </nav>
  );
}
