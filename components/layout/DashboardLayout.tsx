'use client';

import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

