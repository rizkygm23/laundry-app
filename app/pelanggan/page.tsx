'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import PelangganList from '@/components/pelanggan/pelanggan-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PelangganPage() {
  return (
    <DashboardLayout>
      <Card className="shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Manajemen Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <PelangganList />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

