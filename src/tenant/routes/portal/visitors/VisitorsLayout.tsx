import { CalendarPlus } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Page } from '../../../components/layout/page';
import { PageHeader } from '../../../components/patterns/page-header';
import { Button } from '../../../components/ui/button';
import { TabBar } from '../../../components/patterns/navigation-tabs';
import { PORTAL_VISITOR_TABS, matchTab } from '../../../app/nav';

export default function VisitorsLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const active = matchTab(PORTAL_VISITOR_TABS, loc.pathname);
  return (
    <Page workspace archetype={active === 'schedule' || active === 'recurring' ? 'setup' : 'data'} className="ds-portal-workspace">
      <PageHeader
        title="Visitors"
        description="Schedule visitors and track who is coming to your organization."
        actions={<Button variant="primary" size="sm" onClick={() => nav('/portal/visitors/schedule')}><CalendarPlus className="h-4 w-4" />Schedule Visitor</Button>}
      />
      <TabBar className="ds-workspace-tabs" value={active} onChange={(id) => nav(PORTAL_VISITOR_TABS.find((t) => t.id === id)!.path)} tabs={PORTAL_VISITOR_TABS.map((t) => ({ value: t.id, label: t.label }))} />
      <Outlet />
    </Page>
  );
}
