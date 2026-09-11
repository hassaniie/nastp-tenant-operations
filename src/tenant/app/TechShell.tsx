/**
 * The technician shell.
 *
 * Deliberately sparser than the admin rail — a technician is on a ladder with
 * a phone, not at a desk with a dashboard. One bar, the identity, the theme
 * toggle and the way out. No rail, no command palette, no park-wide search.
 */

import { Outlet } from 'react-router-dom';
import { Moon, Sun, Wrench } from 'lucide-react';
import { IconButton } from '../components/ui/button';
import { IconBox } from '../components/ui/icon-box';
import { Tooltip, TooltipProvider } from '../components/ui/tooltip';
import { Toaster } from '../components/ui/toast';
import { useSession } from '../store/session';
import { UserMenu } from './UserMenu';
import { IdleMonitor } from './IdleMonitor';
import { AppMain, AppShellColumn, AppShellFrame, AppTopbar } from '../components/layout/app-shell';
import { Breadcrumb } from '../components/patterns/breadcrumb';

export function TechShell() {
  const { prefs, setPrefs } = useSession();

  return (
    <TooltipProvider>
      <AppShellFrame viewport>
        <AppShellColumn>
        <AppTopbar>
          <div className="flex items-center gap-2.5">
            <IconBox icon={Wrench} tone="service" size="sm" />
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-foreground">NASTP Service</p>
              <p className="text-[11px] text-subtle">Technician workspace</p>
            </div>
          </div>

          <Breadcrumb className="hidden flex-1 sm:block" items={[{ label: 'Service workspace' }, { label: 'My jobs' }]} />
          <div className="flex-1 sm:hidden" />

          <Tooltip content={`Switch to ${prefs.theme === 'dark' ? 'light' : 'dark'} theme`}>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
              label="Toggle theme"
            >
              {prefs.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconButton>
          </Tooltip>

          <UserMenu />
        </AppTopbar>

        <AppMain><Outlet /></AppMain>

        <Toaster />
        <IdleMonitor />
        </AppShellColumn>
      </AppShellFrame>
    </TooltipProvider>
  );
}
