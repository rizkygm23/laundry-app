'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function MobileHeader() {
  const { user, signOut } = useAuth();

  const getUserInitials = () => {
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <h1 className="text-xl font-bold text-blue-600">Necis Laundry</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button id="mobile-profile-dropdown-trigger" variant="ghost" size="icon" className="h-10 w-10">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem id="mobile-logout-btn" onClick={signOut} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}


