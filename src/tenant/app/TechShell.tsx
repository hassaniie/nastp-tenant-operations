/**
 * The technician shell.
 *
 * Deliberately sparser than the admin rail — a technician is on a ladder with
 * a phone, not at a desk with a dashboard. One bar, the identity, the theme
 * toggle and the way out. No rail, no command palette, no park-wide search.
 */

import { Outlet } from 'react-router-dom';
import { Moon, Sun, Wrench } from 'lucide-react';
import { Button, IconBox } from '../components/ui/primitives';
import { Tooltip, TooltipProvider } from '../components/ui/overlay';
import { Toaster } from '../components/ui/toast';
import { useSession } from '../store/session';
import { UserMenu } from './UserMenu';

export function TechShell() {
  const { prefs, setPrefs } = useSession();

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col bg-canvas text-foreground">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <IconBox icon={Wrench} tone="service" size="sm" />
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-foreground">NASTP Service</p>
              <p className="text-[11px] text-subtle">Technician workspace</p>
            </div>
          </div>

          <div className="flex-1" />

          <Tooltip content={`Switch to ${prefs.theme === 'dark' ? 'light' : 'dark'} theme`}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setPrefs({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
              aria-label="Toggle theme"
            >
              {prefs.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </Tooltip>

          <UserMenu />
        </header>

        <main id="main-scroll" className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <Toaster />
      </div>
    </TooltipProvider>
  );
}
