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
import { QRScanActions } from './QRScanActions';

export interface Transaksi {
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
  searchQuery?: string;
  searchType?: 'nama' | 'kode' | 'qr';
}

export default function TransaksiList({ onUpdate, searchQuery, searchType }: TransaksiListProps) {
  const router = useRouter();
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);

  useEffect(() => {
    loadTransaksi();
  }, [searchQuery, searchType]);

  const loadTransaksi = async () => {
    setLoading(true);
    try {
      let query = supabase.from('transaksi').select('*');

      if (searchQuery && searchType) {
        if (searchType === 'nama') {
          query = query.ilike('nama_pelanggan', `%${searchQuery}%`);
        } else if (searchType === 'kode' || searchType === 'qr') {
          query = query.ilike('kode_struk', `%${searchQuery}%`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading transaksi:', error);
        alert('Gagal memuat data transaksi: ' + error.message);
      } else if (data) {
        setTransaksiList(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Show action menu when QR scan finds exactly one result
  useEffect(() => {
    if (searchType === 'qr' && transaksiList.length === 1 && searchQuery) {
      setSelectedTransaksi(transaksiList[0]);
    } else {
      setSelectedTransaksi(null);
    }
  }, [searchType, transaksiList, searchQuery]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('transaksi')
        .update({ status_transaksi: status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        alert('Gagal memperbarui status: ' + error.message);
        return;
      }

      loadTransaksi();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const updatePembayaran = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('transaksi')
        .update({ status_pembayaran: status })
        .eq('id', id);

      if (error) {
        console.error('Error updating pembayaran:', error);
        alert('Gagal memperbarui status pembayaran: ' + error.message);
        return;
      }

      loadTransaksi();
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const deleteTransaksi = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      try {
        const { error } = await supabase
          .from('transaksi')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting transaksi:', error);
          alert('Gagal menghapus transaksi: ' + error.message);
          return;
        }

        loadTransaksi();
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
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

  const getDeadlineStyle = (deadline: string, status: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Jika sudah selesai, tidak perlu warning
    if (status === 'selesai') {
      return 'text-gray-600';
    }
    
    // Jika sudah lewat deadline
    if (hoursUntilDeadline < 0) {
      return 'text-red-600 font-bold animate-pulse';
    }
    
    // Jika kurang dari 6 jam
    if (hoursUntilDeadline < 6) {
      return 'text-red-600 font-semibold';
    }
    
    // Jika kurang dari 12 jam
    if (hoursUntilDeadline < 12) {
      return 'text-orange-600 font-medium';
    }
    
    // Jika kurang dari 24 jam
    if (hoursUntilDeadline < 24) {
      return 'text-yellow-600';
    }
    
    return 'text-gray-600';
  };

  const getDeadlineBadge = (deadline: string, status: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (status === 'selesai') {
      return null;
    }
    
    if (hoursUntilDeadline < 0) {
      return <Badge className="ml-2 bg-red-600 text-white">TERLAMBAT</Badge>;
    }
    
    if (hoursUntilDeadline < 6) {
      return <Badge className="ml-2 bg-red-500 text-white">URGENT</Badge>;
    }
    
    if (hoursUntilDeadline < 12) {
      return <Badge className="ml-2 bg-orange-500 text-white">SEGERA</Badge>;
    }
    
    return null;
  };

  if (loading) {
    return <div className="text-center py-8">Memuat data...</div>;
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateStatus(id, status);
  };

  const handleUpdatePembayaran = async (id: string, status: string) => {
    await updatePembayaran(id, status);
  };

  return (
    <div>
      <QRScanActions
        transaksi={selectedTransaksi}
        open={!!selectedTransaksi}
        onClose={() => setSelectedTransaksi(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdatePembayaran={handleUpdatePembayaran}
      />
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
                    <div className="flex items-center">
                      <span className={getDeadlineStyle(transaksi.deadline, transaksi.status_transaksi)}>
                        {format(new Date(transaksi.deadline), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                      </span>
                      {getDeadlineBadge(transaksi.deadline, transaksi.status_transaksi)}
                    </div>
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
