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
  alamat_pelanggan: string | null;
  id_pelanggan: string | null;
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
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [pelangganInfo, setPelangganInfo] = useState<{
    nama: string | null;
    nomor_hp: string | null;
    alamat: string | null;
  } | null>(null);

  useEffect(() => {
    loadTransaksi();
  }, [params.kode]);

  const loadTransaksi = async () => {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .eq('kode_struk', params.kode)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Gagal memuat struk:', error);
      return;
    }

    if (data && data.length > 0) {
      setTransaksiList(data);
      const pelangganId = data[0].id_pelanggan;
      if (pelangganId) {
        fetchPelanggan(pelangganId);
      } else {
        setPelangganInfo({
          nama: data[0].nama_pelanggan ?? null,
          nomor_hp: null,
          alamat: data[0].alamat_pelanggan ?? null,
        });
      }
      generateQRCode(params.kode);
    }
  };

  const fetchPelanggan = async (pelangganId: string) => {
    const { data, error } = await supabase
      .from('pelanggan')
      .select('nama, nomor_hp, alamat')
      .eq('id', pelangganId)
      .maybeSingle();

    if (error) {
      console.error('Gagal memuat data pelanggan:', error);
      return;
    }

    if (data) {
      setPelangganInfo({
        nama: data.nama,
        nomor_hp: data.nomor_hp,
        alamat: data.alamat,
      });
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
    if (transaksiList.length === 0) return;

    const first = transaksiList[0];
    const totalPembayaran = transaksiList.reduce((sum, item) => sum + item.total, 0);
    const detailLayanan = transaksiList
      .map(
        (item) =>
          `- ${item.nama_layanan} (${item.jumlah}) : Rp ${item.total.toLocaleString('id-ID')}`
      )
      .join('\n');
    const statusUrl = `${getBaseUrl()}/status/${first.kode_struk}`;

    const message = `Terima kasih ${first.nama_pelanggan} telah menggunakan layanan laundry kami!\n\nCek status pesanan Anda di:\n${statusUrl}`;

    const nomorHp = pelangganInfo?.nomor_hp?.replace(/^0/, '62');
    const whatsappUrl = nomorHp
      ? `https://wa.me/${nomorHp}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    if (!nomorHp && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(message).catch(() => { });
      alert('Nomor WhatsApp pelanggan tidak tersedia. Pesan struk telah disalin ke clipboard.');
    }

    window.open(whatsappUrl, '_blank');
  };

  if (transaksiList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Memuat struk...</div>
      </div>
    );
  }

  const first = transaksiList[0];
  const totalPembayaran = transaksiList.reduce((sum, item) => sum + item.total, 0);
  const isSemuaLunas = transaksiList.every((item) => item.status_pembayaran === 'lunas');
  const statusPembayaran = isSemuaLunas ? 'lunas' : 'belum_lunas';
  const statusTransaksi = first.status_transaksi;
  const maxDeadline = transaksiList.reduce((latest, item) => {
    const itemDeadline = new Date(item.deadline);
    return itemDeadline > latest ? itemDeadline : latest;
  }, new Date(first.deadline));

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
        <div className="no-print mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full sm:w-auto h-11 sm:h-10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-11 sm:h-10"
          >
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
          <Button
            onClick={handleShare}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-11 sm:h-10"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Kirim WA
          </Button>
        </div>

        <Card ref={strukRef} className="p-4 sm:p-8 bg-white print:shadow-none">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">LAUNDRY</h1>
            <div className="text-xs sm:text-sm text-gray-600">
              <p>Jl. Contoh No. 123</p>
              <p>Telp: 0812-3456-7890</p>
            </div>
          </div>

          <div className="border-t-2 border-b-2 border-dashed border-gray-300 py-3 sm:py-4 mb-3 sm:mb-4">
            <div className="text-center mb-2">
              <div className="text-[10px] sm:text-xs text-gray-600">KODE TRANSAKSI</div>
              <div className="text-lg sm:text-2xl font-bold font-mono break-all">{first.kode_struk}</div>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 text-center">
              {format(new Date(first.created_at), 'dd MMMM yyyy HH:mm', { locale: idLocale })}
            </div>
          </div>

          <div className="space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Nama:</span>
              <span className="font-semibold text-right">
                {pelangganInfo?.nama || first.nama_pelanggan || '-'}
              </span>
            </div>
            {pelangganInfo?.nomor_hp && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">No. HP:</span>
                <span className="font-semibold">{pelangganInfo.nomor_hp}</span>
              </div>
            )}
            {(pelangganInfo?.alamat || first.alamat_pelanggan) && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">Alamat:</span>
                <span className="font-semibold text-right max-w-xs break-words">
                  {pelangganInfo?.alamat || first.alamat_pelanggan}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-300 pt-3 sm:pt-4 mb-3 sm:mb-4 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[300px]">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Layanan</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Harga</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaksiList.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 break-words">{item.nama_layanan}</td>
                    <td className="text-center py-2">{item.jumlah}</td>
                    <td className="text-right py-2">
                      Rp {item.harga_layanan.toLocaleString('id-ID')}
                    </td>
                    <td className="text-right py-2 font-semibold">
                      Rp {item.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t-2 border-gray-300 pt-3 sm:pt-4 mb-4 sm:mb-6">
            <div className="flex justify-between text-base sm:text-lg font-bold">
              <span>TOTAL PEMBAYARAN</span>
              <span>Rp {totalPembayaran.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status Transaksi:</span>
              <span className="font-semibold uppercase">{statusTransaksi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status Pembayaran:</span>
              <span className="font-semibold uppercase">
                {statusPembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimasi Selesai:</span>
              <span className="font-semibold">
                {format(maxDeadline, 'dd MMM yyyy HH:mm', { locale: idLocale })}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 pt-4 sm:pt-6">
            <div className="text-center mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-semibold mb-2">Scan QR untuk Cek Status</p>
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 sm:w-48 sm:h-48" />
                </div>
              )}
              <p className="text-[10px] sm:text-xs text-gray-600 mt-2 break-all px-2">
                atau kunjungi: {getBaseUrl()}/status/{first.kode_struk}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-3 sm:pt-4 mt-4 sm:mt-6 text-center text-[10px] sm:text-xs text-gray-600">
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
