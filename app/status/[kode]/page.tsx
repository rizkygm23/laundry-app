'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, Clock, Package, MapPin, Search, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface Transaksi {
  id: string;
  kode_struk: string;
  nama_pelanggan: string;
  nama_layanan: string;
  jumlah: number;
  total: number;
  status_transaksi: string;
  status_pembayaran: string;
  created_at: string;
  deadline: string;
}

const steps = [
  { id: 'penjemputan', label: 'Penjemputan', icon: Truck },
  { id: 'antrian', label: 'Di Outlet', icon: Package },
  { id: 'proses', label: 'Sedang Dicuci', icon: Clock },
  { id: 'selesai', label: 'Selesai', icon: CheckCircle2 },
  { id: 'terkirim', label: 'Diantar/Diambil', icon: MapPin },
];

export default function StatusPage({ params }: { params: { kode: string } }) {
  const router = useRouter();
  const [transaksiList, setTransaksiList] = useState<Transaksi[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.kode) {
      loadTransaksi(params.kode);
    }
  }, [params.kode]);

  const loadTransaksi = async (kode: string) => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .eq('kode_struk', kode);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Data tidak ditemukan');

      setTransaksiList(data);
    } catch (err) {
      console.error(err);
      setError('Pesanan tidak ditemukan. Mohon cek kembali kode Anda.');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepId: string) => {
    if (!transaksiList || transaksiList.length === 0) return 'inactive';
    // Gunakan status dari item pertama (asumsi semua item dalam satu struk punya status sama)
    const currentStatus = transaksiList[0].status_transaksi;

    const statusOrder = ['penjemputan', 'antrian', 'proses', 'selesai', 'terkirim'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepId);

    if (currentIdx === stepIdx) return 'current';
    if (currentIdx > stepIdx) return 'completed';
    return 'inactive';
  };

  // Helper variables derived from the list
  const mainTransaksi = transaksiList ? transaksiList[0] : null;
  const totalPembayaran = transaksiList ? transaksiList.reduce((acc, curr) => acc + curr.total, 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Depan
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Lacak Pesanan</h1>
        </div>

        {/* Search Box if accessed directly or not found */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex gap-2">
          <Input
            placeholder="Masukkan Kode Pesanan (Contoh: OL2312230001)"
            defaultValue={params.kode}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                router.push(`/status/${e.currentTarget.value}`);
              }
            }}
          />
          <Button onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            router.push(`/status/${input.value}`);
          }}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Checking status...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg">{error}</div>
        ) : mainTransaksi && transaksiList ? (
          <Card className="shadow-lg border-t-4 border-t-blue-600">
            <CardHeader className="bg-gray-50/50 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-blue-900">{mainTransaksi.kode_struk}</CardTitle>
                  <CardDescription>
                    Pelanggan: {mainTransaksi.nama_pelanggan}
                  </CardDescription>
                </div>
                <Badge className="text-lg px-4 py-1" variant={mainTransaksi.status_pembayaran === 'lunas' ? 'default' : 'destructive'}>
                  {mainTransaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM BAYAR'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              {/* Timeline */}
              <div className="relative mb-12">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 hidden sm:block"></div>
                <div className="absolute left-4 top-0  w-1 h-full bg-gray-200 -z-10 block sm:hidden"></div>

                <div className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-0">
                  {steps.map((step) => {
                    const status = getStepStatus(step.id);
                    const Icon = step.icon;
                    let colorClass = 'bg-gray-200 text-gray-500';
                    if (status === 'completed') colorClass = 'bg-blue-600 text-white';
                    if (status === 'current') colorClass = 'bg-blue-600 text-white ring-4 ring-blue-100';

                    return (
                      <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-2 bg-white sm:bg-transparent p-2 sm:p-0 rounded-lg z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`text-sm font-medium ${status === 'current' ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Detail Layanan</h3>
                  <div className="space-y-4">
                    {transaksiList.map((item) => (
                      <div key={item.id} className="border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Layanan</span>
                          <span className="font-medium">{item.nama_layanan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Jumlah</span>
                          <span className="font-medium">{item.jumlah}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>Subtotal</span>
                          <span>Rp {item.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <span className="text-gray-500 font-semibold">Total Estimasi</span>
                      <span className="font-bold text-lg text-blue-600">Rp {totalPembayaran.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Jadwal</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Dipesan</span>
                      <span className="font-medium">{new Date(mainTransaksi.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Estimasi Selesai</span>
                      <span className="font-medium">{new Date(mainTransaksi.deadline).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
