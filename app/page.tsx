'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Users, CreditCard, Settings } from 'lucide-react';
import Link from 'next/link';
import TransaksiList from '@/components/transaksi/transaksi-list';
import LayananList from '@/components/layanan/layanan-list';
import PelangganList from '@/components/pelanggan/pelanggan-list';

export default function Home() {
  const [stats, setStats] = useState({
    totalTransaksi: 0,
    transaksiAntrian: 0,
    transaksiProses: 0,
    transaksiSelesai: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: transaksiData } = await supabase
      .from('transaksi')
      .select('status_transaksi');

    if (transaksiData) {
      setStats({
        totalTransaksi: transaksiData.length,
        transaksiAntrian: transaksiData.filter(t => t.status_transaksi === 'antrian').length,
        transaksiProses: transaksiData.filter(t => t.status_transaksi === 'proses').length,
        transaksiSelesai: transaksiData.filter(t => t.status_transaksi === 'selesai').length,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Laundry Management</h1>
          <p className="text-gray-600">Kelola bisnis laundry Anda dengan mudah</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transaksi</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalTransaksi}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Antrian</CardTitle>
              <CreditCard className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.transaksiAntrian}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-cyan-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Proses</CardTitle>
              <Settings className="h-5 w-5 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.transaksiProses}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Selesai</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.transaksiSelesai}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900">Manajemen Laundry</CardTitle>
              <Link href="/transaksi/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Transaksi Baru
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="transaksi" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
                <TabsTrigger value="transaksi" className="data-[state=active]:bg-white">
                  Transaksi
                </TabsTrigger>
                <TabsTrigger value="layanan" className="data-[state=active]:bg-white">
                  Layanan
                </TabsTrigger>
                <TabsTrigger value="pelanggan" className="data-[state=active]:bg-white">
                  Pelanggan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transaksi" className="mt-0">
                <TransaksiList onUpdate={loadStats} />
              </TabsContent>

              <TabsContent value="layanan" className="mt-0">
                <LayananList />
              </TabsContent>

              <TabsContent value="pelanggan" className="mt-0">
                <PelangganList />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
