import { FilePlus2 } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Page } from '../../../components/layout/page';
import { PageHeader } from '../../../components/patterns/page-header';
import { Button } from '../../../components/ui/button';
import { TabBar } from '../../../components/patterns/navigation-tabs';
import { PORTAL_SERVICE_TABS, matchTab } from '../../../app/nav';

export default function ServiceLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const active = matchTab(PORTAL_SERVICE_TABS, loc.pathname);
  return (
    <Page workspace archetype={active === 'new' ? 'setup' : 'data'} className="ds-portal-workspace">
      <PageHeader
        title="Service Center"
        description="Raise and track building service requests with the NASTP team."
        actions={<Button variant="primary" size="sm" onClick={() => nav('/portal/service/new')}><FilePlus2 className="h-4 w-4" />New Request</Button>}
      />
      <TabBar className="ds-workspace-tabs" value={active} onChange={(id) => nav(PORTAL_SERVICE_TABS.find((t) => t.id === id)!.path)} tabs={PORTAL_SERVICE_TABS.map((t) => ({ value: t.id, label: t.label }))} />
      <Outlet />
    </Page>
  );
}
