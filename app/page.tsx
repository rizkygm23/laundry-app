'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, Users, CreditCard, Settings } from 'lucide-react';
import Link from 'next/link';
import TransaksiList from '@/components/transaksi/transaksi-list';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransaksiSearch } from '@/components/transaksi/TransaksiSearch';

export default function Home() {
  const [stats, setStats] = useState({
    totalTransaksi: 0,
    transaksiAntrian: 0,
    transaksiProses: 0,
    transaksiSelesai: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'nama' | 'kode' | 'qr'>('nama');

  useEffect(() => {
    loadStats();
  }, []);

  const handleSearch = (query: string, type: 'nama' | 'kode' | 'qr') => {
    setSearchQuery(query);
    setSearchType(type);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchType('nama');
  };

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Kelola transaksi laundry Anda</p>
          </div>
          <Link href="/transaksi/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Transaksi Baru
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        {/* Transactions List */}
        <Card className="bg-white shadow-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold text-gray-900">Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <TransaksiSearch onSearch={handleSearch} onClear={handleClearSearch} />
            <TransaksiList
              onUpdate={loadStats}
              searchQuery={searchQuery}
              searchType={searchType}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
