'use client';

import { Sidebar } from './Sidebar';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <MobileHeader />
        <main className="flex-1 lg:ml-64 overflow-y-auto pt-16 lg:pt-0 pb-16 lg:pb-0">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}

