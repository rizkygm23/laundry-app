'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Transaksi {
  id: string;
  kode_struk: string;
  nama_pelanggan: string;
  nomor_hp: string;
  alamat_pelanggan: string;
  nama_layanan: string;
  jumlah: number;
  harga_layanan: number;
  total: number;
  status_transaksi: string;
  status_pembayaran: string;
  deadline: string;
  created_at: string;
}

export default function TransaksiDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);

  useEffect(() => {
    loadTransaksi();
  }, [params.id]);

  const loadTransaksi = async () => {
    const { data } = await supabase
      .from('transaksi')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) {
      setTransaksi(data);
    }
  };

  if (!transaksi) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'antrian':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'proses':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'selesai':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-4 sm:mb-6 w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <CardTitle className="text-xl sm:text-2xl">Detail Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start gap-3">
              <div>
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Kode Transaksi</div>
                <div className="text-lg sm:text-2xl font-mono font-bold break-all">{transaksi.kode_struk}</div>
              </div>
              <Badge variant="outline" className={`text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 ${getStatusColor(transaksi.status_transaksi)}`}>
                {transaksi.status_transaksi.toUpperCase()}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Informasi Pelanggan</h3>
                <div>
                  <div className="text-sm text-gray-600">Nama</div>
                  <div className="font-medium">{transaksi.nama_pelanggan}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">No. WhatsApp</div>
                  <div className="font-medium">{transaksi.nomor_hp}</div>
                </div>
                {transaksi.alamat_pelanggan && (
                  <div>
                    <div className="text-sm text-gray-600">Alamat</div>
                    <div className="font-medium">{transaksi.alamat_pelanggan}</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Detail Pesanan</h3>
                <div>
                  <div className="text-sm text-gray-600">Layanan</div>
                  <div className="font-medium">{transaksi.nama_layanan}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Jumlah</div>
                  <div className="font-medium">{transaksi.jumlah}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Harga Satuan</div>
                  <div className="font-medium">Rp {transaksi.harga_layanan.toLocaleString('id-ID')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-2xl font-bold text-blue-600">
                    Rp {transaksi.total.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <div className="text-xs sm:text-sm text-gray-600">Tanggal Order</div>
                  <div className="font-medium text-xs sm:text-sm">
                    {format(new Date(transaksi.created_at), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-600">Estimasi Selesai</div>
                  <div className="font-medium text-xs sm:text-sm">
                    {format(new Date(transaksi.deadline), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                  </div>
                </div>
                <div className="sm:col-span-2 md:col-span-1">
                  <div className="text-xs sm:text-sm text-gray-600">Status Pembayaran</div>
                  <Badge
                    variant="outline"
                    className={`text-xs sm:text-sm ${transaksi.status_pembayaran === 'lunas'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {transaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={() => router.push(`/struk/${transaksi.kode_struk}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-11 sm:h-10"
              >
                <Printer className="mr-2 h-4 w-4" />
                Cetak Struk
              </Button>
              <Button
                onClick={() => router.push(`/qr/${transaksi.kode_struk}`)}
                variant="outline"
                className="flex-1 h-11 sm:h-10"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Lihat QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
