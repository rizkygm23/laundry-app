'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import TransaksiList from '@/components/transaksi/transaksi-list';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransaksiSearch } from '@/components/transaksi/TransaksiSearch';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'default' | 'qr'>('default');

  const handleSearch = (query: string, type: 'nama' | 'kode' | 'qr') => {
    setSearchQuery(query);
    setSearchMode(type === 'qr' ? 'qr' : 'default');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchMode('default');
  };

  const handlePesananUpdate = () => {
    window.dispatchEvent(new Event('transaksi-updated'));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Operasional Pesanan</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Pantau dan kelola pesanan aktif</p>
          </div>
          <Link href="/transaksi/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Pesanan Baru
            </Button>
          </Link>
        </div>

        {/* Transactions List */}
        <Card className="bg-white shadow-xl">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold text-gray-900">Daftar Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <TransaksiSearch onSearch={handleSearch} onClear={handleClearSearch} />
            <TransaksiList
              onUpdate={handlePesananUpdate}
              searchQuery={searchQuery}
              searchType={searchMode === 'qr' ? 'qr' : 'nama'}
              excludeCompleted
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
