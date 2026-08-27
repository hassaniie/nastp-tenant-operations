/**
 * Who is signed in, and the way out.
 *
 * Replaces a hardcoded "A. Raza / NASTP Administrator" block that rendered
 * regardless of who was looking. The identity now comes from the session, so
 * it is correct in all three experiences — and there is finally something to
 * sign out of.
 */

import { LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button } from '../components/ui/primitives';
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from '../components/ui/overlay';
import { useAuth } from '../store/auth';
import { doorFor } from '../data/auth';

export function UserMenu() {
  const { session, subject, signOut } = useAuth();
  const navigate = useNavigate();

  if (!session || !subject) return null;

  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-1 gap-2 pl-2 pr-1.5" aria-label="Account">
          <span className="hidden text-right lg:block">
            <span className="block text-[12px] font-medium leading-tight text-foreground">{subject.name}</span>
            <span className="block text-[11px] capitalize leading-tight text-subtle">{subject.title}</span>
          </span>
          <Avatar name={subject.name} seed={subject.name.length * 7} size={30} />
        </Button>
      </MenuTrigger>

      <MenuContent align="end" className="w-[248px]">
        <MenuLabel>
          <span className="block truncate text-foreground">{subject.name}</span>
          <span className="block truncate font-normal normal-case tracking-normal text-subtle">{subject.email}</span>
        </MenuLabel>
        <MenuSeparator />
        <MenuItem disabled>
          <UserRound className="h-4 w-4" />
          <span className="flex-1 capitalize">{subject.title}</span>
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          onSelect={() => {
            const door = doorFor(session.experience);
            signOut();
            navigate(door, { replace: true });
          }}
        >
          <LogOut className="h-4 w-4" />
          <span className="flex-1">Sign out</span>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
