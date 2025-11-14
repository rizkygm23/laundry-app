'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LayananList from '@/components/layanan/layanan-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LayananPage() {
  return (
    <DashboardLayout>
      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            Manajemen Layanan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <LayananList />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

