/**
 * Tenant Portal — Energy section shell. A single page title with secondary
 * navigation across the six energy views (§45), rendering the active view.
 */

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Page } from '../../../components/layout/page';
import { PageHeader } from '../../../components/patterns/page-header';
import { TabBar } from '../../../components/patterns/navigation-tabs';
import { PORTAL_ENERGY_TABS, matchTab } from '../../../app/nav';

export default function EnergyLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const active = matchTab(PORTAL_ENERGY_TABS, loc.pathname);

  return (
    <Page workspace archetype="analytics" className="ds-portal-workspace">
      <PageHeader title="Energy" description="How much energy are we using, what are we being charged, and how does it compare?" />
      <TabBar className="ds-workspace-tabs" value={active} onChange={(id) => nav(PORTAL_ENERGY_TABS.find((t) => t.id === id)!.path)} tabs={PORTAL_ENERGY_TABS.map((t) => ({ value: t.id, label: t.label }))} />
      <Outlet />
    </Page>
  );
}
