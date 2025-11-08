'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import QRCode from 'qrcode';
import { getBaseUrl } from '@/lib/url';

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

export default function StrukPage({ params }: { params: { kode: string } }) {
  const router = useRouter();
  const strukRef = useRef<HTMLDivElement>(null);
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    loadTransaksi();
  }, [params.kode]);

  const loadTransaksi = async () => {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .eq('kode_struk', params.kode)
      .single();

    if (data) {
      setTransaksi(data);
      generateQRCode(data.kode_struk);
    }
  };

  const generateQRCode = async (kode: string) => {
    const url = `${getBaseUrl()}/status/${kode}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
    });
    setQrCodeUrl(qrDataUrl);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!transaksi) return;

    const message = `*STRUK LAUNDRY*\n\nKode: ${transaksi.kode_struk}\nNama: ${transaksi.nama_pelanggan}\nLayanan: ${transaksi.nama_layanan}\nJumlah: ${transaksi.jumlah}\nTotal: Rp ${transaksi.total.toLocaleString('id-ID')}\n\nCek status pesanan: ${getBaseUrl()}/status/${transaksi.kode_struk}`;

    const whatsappUrl = `https://wa.me/${transaksi.nomor_hp?.replace(/^0/, '62')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!transaksi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="no-print mb-6 flex gap-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button onClick={handleShare} className="bg-green-600 hover:bg-green-700">
            <Share2 className="mr-2 h-4 w-4" />
            Kirim WA
          </Button>
        </div>

        <Card ref={strukRef} className="p-8 bg-white print:shadow-none">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">LAUNDRY</h1>
            <div className="text-sm text-gray-600">
              <p>Jl. Contoh No. 123</p>
              <p>Telp: 0812-3456-7890</p>
            </div>
          </div>

          <div className="border-t-2 border-b-2 border-dashed border-gray-300 py-4 mb-4">
            <div className="text-center mb-2">
              <div className="text-xs text-gray-600">KODE TRANSAKSI</div>
              <div className="text-2xl font-bold font-mono">{transaksi.kode_struk}</div>
            </div>
            <div className="text-xs text-gray-600 text-center">
              {format(new Date(transaksi.created_at), 'dd MMMM yyyy HH:mm', { locale: idLocale })}
            </div>
          </div>

          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nama:</span>
              <span className="font-semibold">{transaksi.nama_pelanggan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">No. HP:</span>
              <span className="font-semibold">{transaksi.nomor_hp}</span>
            </div>
            {transaksi.alamat_pelanggan && (
              <div className="flex justify-between">
                <span className="text-gray-600">Alamat:</span>
                <span className="font-semibold text-right max-w-xs">{transaksi.alamat_pelanggan}</span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-300 pt-4 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Layanan</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Harga</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2">{transaksi.nama_layanan}</td>
                  <td className="text-center py-2">{transaksi.jumlah}</td>
                  <td className="text-right py-2">Rp {transaksi.harga_layanan.toLocaleString('id-ID')}</td>
                  <td className="text-right py-2 font-semibold">Rp {transaksi.total.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t-2 border-gray-300 pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL PEMBAYARAN</span>
              <span>Rp {transaksi.total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status Transaksi:</span>
              <span className="font-semibold uppercase">{transaksi.status_transaksi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status Pembayaran:</span>
              <span className="font-semibold uppercase">{transaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimasi Selesai:</span>
              <span className="font-semibold">
                {format(new Date(transaksi.deadline), 'dd MMM yyyy HH:mm', { locale: idLocale })}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 pt-6">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold mb-2">Scan QR untuk Cek Status</p>
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-xs text-gray-600 mt-2">
                atau kunjungi: {getBaseUrl()}/status/{transaksi.kode_struk}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-4 mt-6 text-center text-xs text-gray-600">
            <p className="mb-1">Terima kasih atas kepercayaan Anda</p>
            <p>Barang yang sudah diambil tidak dapat dikembalikan</p>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .container {
            max-width: 100%;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
