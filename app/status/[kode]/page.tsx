'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface TransaksiRow {
  id: string;
  kode_struk: string;
  nama_pelanggan: string;
  nama_layanan: string;
  jumlah: number;
  total: number;
  status_transaksi: string;
  status_pembayaran: string;
  deadline: string;
  created_at: string;
}

export default function StatusPage({ params }: { params: { kode: string } }) {
  const [transaksiList, setTransaksiList] = useState<TransaksiRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTransaksi();

    const channel = supabase
      .channel('status-transaksi')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaksi',
          filter: `kode_struk=eq.${params.kode}`,
        },
        () => {
          loadTransaksi();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.kode]);

  const loadTransaksi = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transaksi')
      .select(
        'id,kode_struk,nama_pelanggan,nama_layanan,jumlah,total,status_transaksi,status_pembayaran,deadline,created_at'
      )
      .eq('kode_struk', params.kode)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Gagal memuat transaksi:', error);
      setErrorMessage('Gagal memuat data pesanan. Coba beberapa saat lagi.');
      setTransaksiList([]);
      setSelectedId(null);
    } else if (data && data.length > 0) {
      const result = data as TransaksiRow[];
      setErrorMessage(null);
      setTransaksiList(result);
      setSelectedId((prev) => {
        if (prev && result.some((item) => item.id === prev)) {
          return prev;
        }
        return result[0].id;
      });
    } else {
      setErrorMessage('Kode struk tidak valid atau pesanan telah dihapus.');
      setTransaksiList([]);
      setSelectedId(null);
    }
    setLoading(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'antrian':
        return {
          icon: Clock,
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          label: 'ANTRIAN',
          description: 'Pesanan Anda sedang dalam antrian'
        };
      case 'proses':
        return {
          icon: Package,
          color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
          label: 'DALAM PROSES',
          description: 'Pesanan Anda sedang dikerjakan'
        };
      case 'selesai':
        return {
          icon: CheckCircle2,
          color: 'bg-green-100 text-green-800 border-green-300',
          label: 'SELESAI',
          description: 'Pesanan Anda sudah selesai dan siap diambil'
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          label: status.toUpperCase(),
          description: ''
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!loading && !transaksiList.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Transaksi Tidak Ditemukan</h2>
            <p className="text-gray-600">
              {errorMessage || 'Kode struk tidak valid atau transaksi sudah dihapus.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const transaksi =
    transaksiList.find((item) => item.id === selectedId) ?? transaksiList[0];

  const statusInfo = getStatusInfo(transaksi.status_transaksi);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Status Pesanan</h1>
          <p className="text-sm sm:text-base text-gray-600">Lacak status laundry Anda secara real-time</p>
        </div>

        {transaksiList.length > 1 && (
          <Card className="shadow-md mb-4 sm:mb-6">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg text-gray-800">
                Pilih layanan yang ingin dicek statusnya
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3 sm:p-6">
              <div className="grid gap-2 sm:gap-3 grid-cols-1 md:grid-cols-2">
                {transaksiList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`rounded-xl border p-3 sm:p-4 text-left transition ${
                      item.id === transaksi.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm text-gray-500">Layanan</div>
                    <div className="font-semibold text-sm sm:text-base text-gray-900">{item.nama_layanan}</div>
                    <div className="mt-2 flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <span>Jumlah: {item.jumlah}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] sm:text-xs ${item.status_pembayaran === 'lunas'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-red-100 text-red-800 border-red-300'}`}
                      >
                        {item.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500">
                Setiap layanan dalam struk ini memiliki status pengerjaan masing-masing.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="no-print mb-3 sm:mb-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => window.open(`/struk/${transaksi.kode_struk}`, '_blank')}
            className="w-full sm:w-auto h-11 sm:h-10"
          >
            Cetak Struk
          </Button>
        </div>

        <Card className="shadow-xl mb-4 sm:mb-6">
          <CardHeader className="bg-blue-600 text-white p-4 sm:p-6">
            <CardTitle className="text-center">
              <div className="text-xs sm:text-sm opacity-90 mb-1">Kode Transaksi</div>
              <div className="text-xl sm:text-3xl font-mono font-bold break-all">{transaksi.kode_struk}</div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-blue-100 mb-3 sm:mb-4">
                <StatusIcon className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
              </div>
              <Badge variant="outline" className={`text-sm sm:text-lg px-4 sm:px-6 py-1 sm:py-2 ${statusInfo.color}`}>
                {statusInfo.label}
              </Badge>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">{statusInfo.description}</p>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex justify-between py-2 sm:py-3 border-b text-xs sm:text-sm">
                <span className="text-gray-600">Nama Pelanggan</span>
                <span className="font-semibold text-right break-words ml-2">{transaksi.nama_pelanggan}</span>
              </div>
              <div className="flex justify-between py-2 sm:py-3 border-b text-xs sm:text-sm">
                <span className="text-gray-600">Layanan</span>
                <span className="font-semibold text-right break-words ml-2">{transaksi.nama_layanan}</span>
              </div>
              <div className="flex justify-between py-2 sm:py-3 border-b text-xs sm:text-sm">
                <span className="text-gray-600">Jumlah</span>
                <span className="font-semibold">{transaksi.jumlah}</span>
              </div>
              <div className="flex justify-between py-2 sm:py-3 border-b text-xs sm:text-sm">
                <span className="text-gray-600">Total Biaya</span>
                <span className="font-semibold text-base sm:text-lg text-blue-600">
                  Rp {transaksi.total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Tanggal Order</span>
                <span className="font-medium text-right break-words ml-2">
                  {format(new Date(transaksi.created_at), 'dd MMMM yyyy HH:mm', { locale: idLocale })}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Estimasi Selesai</span>
                <span className="font-medium text-right break-words ml-2">
                  {format(new Date(transaksi.deadline), 'dd MMMM yyyy HH:mm', { locale: idLocale })}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Status Pembayaran</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] sm:text-xs ${transaksi.status_pembayaran === 'lunas'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {transaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Halaman ini akan otomatis terupdate saat status pesanan berubah
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
