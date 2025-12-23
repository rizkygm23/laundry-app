'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Package,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, shortName: 'Home' },
  { name: 'Transaksi', href: '/transaksi', icon: ClipboardList, shortName: 'Transaksi' },
  { name: 'Kas', href: '/kas', icon: DollarSign, shortName: 'Kas' },
  { name: 'Layanan', href: '/layanan', icon: Package, shortName: 'Layanan' },
  { name: 'Pelanggan', href: '/pelanggan', icon: Users, shortName: 'Pelanggan' },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors relative',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-blue-600')} />
              <span className={cn('text-[10px] leading-tight text-center truncate w-full', isActive && 'text-blue-600 font-semibold')}>
                {item.shortName}
              </span>
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

