'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LayananList from '@/components/layanan/layanan-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LayananPage() {
  return (
    <DashboardLayout>
      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Manajemen Layanan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <LayananList />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

