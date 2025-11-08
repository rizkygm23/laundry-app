'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Transaksi {
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
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaksi();

    const channel = supabase
      .channel('transaksi-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
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
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .eq('kode_struk', params.kode)
      .maybeSingle();

    if (data) {
      setTransaksi(data);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!transaksi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Transaksi Tidak Ditemukan</h2>
            <p className="text-gray-600">Kode struk tidak valid atau transaksi sudah dihapus.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(transaksi.status_transaksi);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Status Pesanan</h1>
          <p className="text-gray-600">Lacak status laundry Anda secara real-time</p>
        </div>

        <Card className="shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <CardTitle className="text-center">
              <div className="text-sm opacity-90 mb-1">Kode Transaksi</div>
              <div className="text-3xl font-mono font-bold">{transaksi.kode_struk}</div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-4">
                <StatusIcon className="w-12 h-12 text-blue-600" />
              </div>
              <Badge variant="outline" className={`text-lg px-6 py-2 ${statusInfo.color}`}>
                {statusInfo.label}
              </Badge>
              <p className="text-gray-600 mt-2">{statusInfo.description}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Nama Pelanggan</span>
                <span className="font-semibold">{transaksi.nama_pelanggan}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Layanan</span>
                <span className="font-semibold">{transaksi.nama_layanan}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Jumlah</span>
                <span className="font-semibold">{transaksi.jumlah}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Total Biaya</span>
                <span className="font-semibold text-lg text-blue-600">
                  Rp {transaksi.total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tanggal Order</span>
                <span className="font-medium">
                  {format(new Date(transaksi.created_at), 'dd MMMM yyyy HH:mm', { locale: idLocale })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimasi Selesai</span>
                <span className="font-medium">
                  {format(new Date(transaksi.deadline), 'dd MMMM yyyy HH:mm', { locale: idLocale })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status Pembayaran</span>
                <Badge
                  variant="outline"
                  className={transaksi.status_pembayaran === 'lunas'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                  }
                >
                  {transaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-600">
              Halaman ini akan otomatis terupdate saat status pesanan berubah
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
