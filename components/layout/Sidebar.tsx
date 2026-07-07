'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Users,
  LogOut,
  ClipboardList,
  DollarSign,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pesanan Baru', href: '/transaksi/create', icon: PlusCircle },
  { name: 'Transaksi', href: '/transaksi', icon: ClipboardList },
  { name: 'Kas', href: '/kas', icon: DollarSign },
  { name: 'Layanan', href: '/layanan', icon: Package },
  { name: 'Pelanggan', href: '/pelanggan', icon: Users },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const getUserInitials = () => {
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <>
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside
        className={cn(
          'hidden lg:flex fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex-col'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Necis Laundry</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button id="profile-dropdown-trigger" variant="ghost" className="w-full justify-start gap-3 h-auto py-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full">
                      {user?.email || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">Profile</span>
                  </div>
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
                <DropdownMenuItem id="logout-btn" onClick={signOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}

