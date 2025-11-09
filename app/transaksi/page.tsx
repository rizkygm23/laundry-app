'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CreditCard, Settings, Users } from 'lucide-react';
import { TransaksiSearch } from '@/components/transaksi/TransaksiSearch';
import TransaksiList from '@/components/transaksi/transaksi-list';

export default function TransaksiPage() {
  const [stats, setStats] = useState({
    total: 0,
    antrian: 0,
    proses: 0,
    selesai: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'default' | 'qr'>('default');

  useEffect(() => {
    loadStats();

    const handleUpdate = () => {
      loadStats();
    };

    window.addEventListener('transaksi-updated', handleUpdate);
    return () => window.removeEventListener('transaksi-updated', handleUpdate);
  }, []);

  const loadStats = async () => {
    const { data, error } = await supabase.from('transaksi').select('status_transaksi');

    if (error) {
      console.error('Gagal memuat ringkasan transaksi:', error);
      return;
    }

    if (data) {
      setStats({
        total: data.length,
        antrian: data.filter((t) => t.status_transaksi === 'antrian').length,
        proses: data.filter((t) => t.status_transaksi === 'proses').length,
        selesai: data.filter((t) => t.status_transaksi === 'selesai').length,
      });
    }
  };

  const handleSearch = (query: string, type: 'nama' | 'kode' | 'qr') => {
    setSearchQuery(query);
    setSearchMode(type === 'qr' ? 'qr' : 'default');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchMode('default');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ringkasan Transaksi</h1>
          <p className="text-gray-600 text-sm sm:text-base">Pantau performa dan riwayat pesanan laundry.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transaksi</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Antrian</CardTitle>
              <CreditCard className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.antrian}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-cyan-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Proses</CardTitle>
              <Settings className="h-5 w-5 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.proses}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Selesai</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.selesai}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold text-gray-900">Semua Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <TransaksiSearch onSearch={handleSearch} onClear={handleClearSearch} />
            <TransaksiList
              onUpdate={loadStats}
              searchQuery={searchQuery}
              searchType={searchMode === 'qr' ? 'qr' : 'nama'}
              view="table"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


