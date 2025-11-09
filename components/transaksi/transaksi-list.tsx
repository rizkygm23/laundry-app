'use client';

import { useState, useEffect, useCallback } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  QrCode,
  Printer,
  Trash2,
  Eye,
  Package,
  User,
  Clock3,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
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
  nomor_hp?: string;
  alamat_pelanggan?: string;
}

interface TransaksiListProps {
  onUpdate?: () => void;
  searchQuery?: string;
  searchType?: 'nama' | 'kode' | 'qr';
  view?: 'cards' | 'table';
  excludeCompleted?: boolean;
}

const cardAccent: Record<string, string> = {
  antrian: 'border-l-4 border-l-amber-500 bg-amber-50/60',
  proses: 'border-l-4 border-l-cyan-500 bg-cyan-50/60',
  selesai: 'border-l-4 border-l-green-500 bg-green-50/60',
  default: 'border-l-4 border-l-gray-200 bg-white',
};

export default function TransaksiList({
  onUpdate,
  searchQuery,
  searchType = 'nama',
  view = 'cards',
  excludeCompleted = false,
}: TransaksiListProps) {
  const router = useRouter();
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [activeTransaksi, setActiveTransaksi] = useState<Transaksi | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  const loadTransaksi = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('transaksi').select('*');

      if (searchQuery) {
        query = query.or(
          `nama_pelanggan.ilike.%${searchQuery}%,kode_struk.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading pesanan:', error);
        alert('Gagal memuat data pesanan: ' + error.message);
      } else if (data) {
        const filtered = excludeCompleted
          ? data.filter(
              (item) =>
                !(item.status_transaksi === 'selesai' && item.status_pembayaran === 'lunas')
            )
          : data;

        setTransaksiList(filtered);
      }
    } catch (err) {
      console.error('Unexpected error saat memuat pesanan:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [excludeCompleted, searchQuery]);

  useEffect(() => {
    loadTransaksi();
  }, [loadTransaksi]);

  // Show action menu when QR scan finds exactly one result
  useEffect(() => {
    if (searchType === 'qr' && searchQuery && transaksiList.length === 1) {
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
        alert('Gagal memperbarui status pesanan: ' + error.message);
        return;
      }

      await loadTransaksi();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Unexpected error saat memperbarui status pesanan:', err);
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

      await loadTransaksi();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Unexpected error saat memperbarui pembayaran:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const deleteTransaksi = async (id: string) => {
    const confirmed = confirm('Apakah Anda yakin ingin menghapus pesanan ini?');
    if (!confirmed) return false;

    try {
      const { error } = await supabase
        .from('transaksi')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting pesanan:', error);
        alert('Gagal menghapus pesanan: ' + error.message);
        return false;
      }

      await loadTransaksi();
      if (onUpdate) onUpdate();
      return true;
    } catch (err) {
      console.error('Unexpected error saat menghapus pesanan:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
      return false;
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

    if (status === 'selesai') {
      return 'text-gray-600';
    }

    if (hoursUntilDeadline < 0) {
      return 'text-red-600 font-bold animate-pulse';
    }

    if (hoursUntilDeadline < 6) {
      return 'text-red-600 font-semibold';
    }

    if (hoursUntilDeadline < 12) {
      return 'text-orange-600 font-medium';
    }

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

  const handleCardClick = (transaksi: Transaksi) => {
    setActiveTransaksi(transaksi);
    setActionModalOpen(true);
  };

  const closeActionModal = () => {
    setActionModalOpen(false);
    setActiveTransaksi(null);
  };

  const handleNavigate = (path: string) => {
    closeActionModal();
    router.push(path);
  };

  const handleDeleteFromModal = async () => {
    if (!activeTransaksi) return;
    const success = await deleteTransaksi(activeTransaksi.id);
    if (success) {
      closeActionModal();
    }
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

  const renderTableView = () => (
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
  );

  const renderCardsView = () => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-sm">
      {transaksiList.map((transaksi) => {
        const accentClass = cardAccent[transaksi.status_transaksi] || cardAccent.default;
        const deadlineDate = new Date(transaksi.deadline);
    const diffMs = deadlineDate.getTime() - Date.now();
    const diffHours = Math.max(0, Math.floor(Math.abs(diffMs) / (1000 * 60 * 60)));
    const diffMinutes = Math.max(
      0,
      Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60))
    );
    const isLate = diffMs < 0;
    const deadlineLabel = isLate
      ? `Terlambat ${diffHours}j ${diffMinutes}m`
      : `Selesai ${diffHours}j ${diffMinutes}m lagi`;

        return (
          <Card
            key={transaksi.id}
            onClick={() => handleCardClick(transaksi)}
            className={cn(
              'cursor-pointer border border-gray-200 hover:border-blue-200 transition hover:shadow-md',
              accentClass
            )}
          >
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {transaksi.nama_pelanggan}
                </p>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    transaksi.status_pembayaran === 'lunas' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {transaksi.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 truncate">
                {transaksi.jumlah} x {transaksi.nama_layanan}
              </p>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-mono text-gray-500">{transaksi.kode_struk}</span>
                <span className={isLate ? 'text-red-600 font-medium' : 'text-gray-500 font-medium'}>
                  {deadlineLabel}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

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
          <p>Belum ada pesanan</p>
        </div>
      ) : (
        <>
          {view === 'table' ? renderTableView() : renderCardsView()}
          <Dialog
            open={actionModalOpen}
            onOpenChange={(open) => {
              setActionModalOpen(open);
              if (!open) {
                setActiveTransaksi(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Kelola Pesanan</DialogTitle>
              </DialogHeader>
              {activeTransaksi && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Kode</span>
                      <span className="font-mono text-lg font-semibold text-gray-900">
                        {activeTransaksi.kode_struk}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Pelanggan</span>
                      <span className="font-semibold text-gray-900">
                        {activeTransaksi.nama_pelanggan}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Layanan</span>
                      <span className="font-semibold text-gray-900">
                        {activeTransaksi.nama_layanan} &middot; {activeTransaksi.jumlah}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Total</span>
                      <span className="font-semibold text-gray-900">
                        Rp {activeTransaksi.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Status</span>
                      <Badge
                        variant="outline"
                        className={getStatusColor(activeTransaksi.status_transaksi)}
                      >
                        {activeTransaksi.status_transaksi.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Pembayaran</span>
                      <Badge
                        variant="outline"
                        className={getPembayaranColor(activeTransaksi.status_pembayaran)}
                      >
                        {activeTransaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" onClick={() => handleNavigate(`/transaksi/${activeTransaksi.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </Button>
                    <Button variant="outline" onClick={() => handleNavigate(`/struk/${activeTransaksi.kode_struk}`)}>
                      <Printer className="mr-2 h-4 w-4" />
                      Cetak Struk
                    </Button>
                    <Button variant="outline" onClick={() => handleNavigate(`/qr/${activeTransaksi.kode_struk}`)}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Lihat QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updatePembayaran(activeTransaksi.id, 'lunas')}
                    >
                      Tandai Lunas
                    </Button>
                    <Button variant="outline" onClick={() => updateStatus(activeTransaksi.id, 'antrian')}>
                      Set Antrian
                    </Button>
                    <Button variant="outline" onClick={() => updateStatus(activeTransaksi.id, 'proses')}>
                      Set Proses
                    </Button>
                    <Button variant="outline" onClick={() => updateStatus(activeTransaksi.id, 'selesai')}>
                      Set Selesai
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteFromModal}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus Pesanan
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}


