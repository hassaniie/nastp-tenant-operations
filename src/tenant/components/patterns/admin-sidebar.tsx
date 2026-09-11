import { ArrowUpRight, Building2, ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ADMIN_NAV, matchNav } from '../../app/nav';
import { cn } from '../../lib/utils';
import { Tooltip } from '../ui/tooltip';
import { IconButton } from '../ui/button';

type Badges = Record<'alerts' | 'overstaying' | 'openRequests' | 'notifications', number>;

/** Canonical Admin application sidebar. Destinations remain owned by app/nav.ts. */
export function AdminSidebar({
  badges,
  collapsed,
  onToggle,
  onNavigate,
  mobile,
  pathname: pathnameOverride,
}: {
  badges: Badges;
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
  /** Deterministic active-state preview for the development workbench. */
  pathname?: string;
}) {
  const location = useLocation();
  const pathname = pathnameOverride ?? location.pathname;
  const match = matchNav(ADMIN_NAV, pathname);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <nav className={cn('ops-nav', collapsed && 'is-collapsed')} aria-label="Primary">
      <div className="ops-brand">
        <Link to="/admin" onClick={onNavigate} aria-label="NASTP dashboard" className="ops-brand-mark">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M6 25V7l20 18V7M6 16l20 9M6 7l20 9" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </Link>
        {!collapsed && <div><strong>NASTP<span>®</span></strong><small>Tenant operations</small></div>}
        {!mobile && (
          <IconButton className="ops-collapse" variant="ghost" size="sm" onClick={onToggle} label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
            {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </IconButton>
        )}
      </div>

      {!collapsed && (
        <div className="ops-workspace">
          <Building2 />
          <div><strong>Park administration</strong><small>Operations workspace</small></div>
          <span className="ops-workspace-dot" />
        </div>
      )}

      <div className="ops-nav-body">
        {!collapsed && <p className="ops-eyebrow">Workspace</p>}
        {ADMIN_NAV.map((group) => {
          const first = group.items[0];
          const isSingle = group.id === 'overview';
          const isOpen = expanded[group.id] ?? match?.group.id === group.id;
          const isActive = match?.group.id === group.id;
          const Icon = first.icon;
          const badge = group.id === 'energy' ? badges.alerts : group.id === 'visitors' ? badges.overstaying : group.id === 'service' ? badges.openRequests : 0;
          const label = isSingle ? 'Overview' : group.label!;

          if (isSingle || collapsed) {
            const link = (
              <Link to={first.path} onClick={onNavigate} className={cn('ops-nav-link', isActive && 'is-active')} aria-current={isActive ? 'page' : undefined}>
                <Icon />
                {!collapsed && <span>{label}</span>}
                {collapsed && badge > 0 && <small className="ops-collapsed-badge">{badge}</small>}
              </Link>
            );
            return <div key={group.id}>{collapsed ? <Tooltip content={label} side="right">{link}</Tooltip> : link}</div>;
          }

          return (
            <div key={group.id} className={cn('ops-nav-group', isOpen && 'is-open', group.id === 'system' && 'ops-system-nav')}>
              <button className={cn('ops-nav-link', isActive && 'is-active')} aria-expanded={isOpen} aria-controls={`nav-${group.id}`}
                onClick={() => setExpanded((value) => ({ ...value, [group.id]: !isOpen }))}>
                <Icon />
                <span>{label}</span>
                {badge > 0 && <small>{badge}</small>}
                <ChevronDown className={cn('ops-chevron', isOpen && 'is-open')} />
              </button>
              {isOpen && (
                <ul id={`nav-${group.id}`} className="ops-subnav">
                  {group.items.map((item) => {
                    const active = match?.leaf.id === item.id;
                    return (
                      <li key={item.id}>
                        <Link to={item.path} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={cn(active && 'is-active')}>
                          <span>{item.label}</span>
                          {item.badge && badges[item.badge] > 0 && <small>{badges[item.badge]}</small>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {!collapsed && (
        <div className="ops-nav-footer">
          <span className="ops-eyebrow">Connected operations</span>
          <p>One park. One workspace.</p>
          <Link to="/admin/settings/buildings" onClick={onNavigate}>Buildings & spaces <ArrowUpRight /></Link>
        </div>
      )}
    </nav>
  );
}
