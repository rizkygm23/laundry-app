'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, QrCode, Printer, Trash2, Eye, Package } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Transaksi {
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

interface TransaksiListProps {
  onUpdate?: () => void;
}

export default function TransaksiList({ onUpdate }: TransaksiListProps) {
  const router = useRouter();
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaksi();
  }, []);

  const loadTransaksi = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transaksi')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTransaksiList(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('transaksi')
      .update({ status_transaksi: status })
      .eq('id', id);

    if (!error) {
      loadTransaksi();
      if (onUpdate) onUpdate();
    }
  };

  const updatePembayaran = async (id: string, status: string) => {
    const { error } = await supabase
      .from('transaksi')
      .update({ status_pembayaran: status })
      .eq('id', id);

    if (!error) {
      loadTransaksi();
    }
  };

  const deleteTransaksi = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      const { error } = await supabase
        .from('transaksi')
        .delete()
        .eq('id', id);

      if (!error) {
        loadTransaksi();
        if (onUpdate) onUpdate();
      }
    }
  };

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

  const getPembayaranColor = (status: string) => {
    return status === 'lunas'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';
  };

  if (loading) {
    return <div className="text-center py-8">Memuat data...</div>;
  }

  return (
    <div>
      {transaksiList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Belum ada transaksi</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Kode</TableHead>
                <TableHead className="font-semibold">Pelanggan</TableHead>
                <TableHead className="font-semibold">Layanan</TableHead>
                <TableHead className="font-semibold">Jumlah</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Pembayaran</TableHead>
                <TableHead className="font-semibold">Deadline</TableHead>
                <TableHead className="font-semibold text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaksiList.map((transaksi) => (
                <TableRow key={transaksi.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono font-medium">{transaksi.kode_struk}</TableCell>
                  <TableCell>{transaksi.nama_pelanggan}</TableCell>
                  <TableCell>{transaksi.nama_layanan}</TableCell>
                  <TableCell>{transaksi.jumlah}</TableCell>
                  <TableCell className="font-semibold">
                    Rp {transaksi.total.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(transaksi.status_transaksi)}>
                      {transaksi.status_transaksi.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPembayaranColor(transaksi.status_pembayaran)}>
                      {transaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaksi.deadline), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => router.push(`/transaksi/${transaksi.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/struk/${transaksi.kode_struk}`)}>
                          <Printer className="mr-2 h-4 w-4" />
                          Cetak Struk
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/qr/${transaksi.kode_struk}`)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          Lihat QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(transaksi.id, 'antrian')}>
                          Set Antrian
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(transaksi.id, 'proses')}>
                          Set Proses
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(transaksi.id, 'selesai')}>
                          Set Selesai
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePembayaran(transaksi.id, 'lunas')}>
                          Tandai Lunas
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteTransaksi(transaksi.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
