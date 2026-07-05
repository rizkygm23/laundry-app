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
  FileImage,
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { QRScanActions } from './QRScanActions';
import { PaymentModal } from './PaymentModal';

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
  metode_pembayaran?: string;
  bukti_pembayaran_url?: string;
}

interface TransaksiListProps {
  onUpdate?: () => void;
  searchQuery?: string;
  searchType?: 'nama' | 'kode' | 'qr';
  view?: 'cards' | 'table';
  excludeCompleted?: boolean;
}

const cardAccent: Record<string, string> = {
  penjemputan: 'border-l-4 border-l-purple-500 bg-purple-50/60',
  terkirim: 'border-l-4 border-l-blue-500 bg-blue-50/60',
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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTransaksiForPayment, setSelectedTransaksiForPayment] = useState<Transaksi | null>(null);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  const loadTransaksi = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('transaksi_laundry').select('*');

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

  // Sync activeTransaksi with transaksiList when it updates
  useEffect(() => {
    setActiveTransaksi((current) => {
      if (!current || transaksiList.length === 0) return current;
      const updated = transaksiList.find((item) => item.id === current.id);
      return updated ? (updated as Transaksi) : current;
    });
  }, [transaksiList]);

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
        .from('transaksi_laundry')
        .update({ status_transaksi: status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        alert('Gagal memperbarui status pesanan: ' + error.message);
        return;
      }

      // Check if transaction is completed and paid, then close modal
      const { data: updatedData } = await supabase
        .from('transaksi_laundry')
        .select('status_transaksi, status_pembayaran')
        .eq('id', id)
        .single();

      if (updatedData && updatedData.status_transaksi === 'selesai' && updatedData.status_pembayaran === 'lunas') {
        closeActionModal();
      }

      await loadTransaksi();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Unexpected error saat memperbarui status pesanan:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const updatePembayaran = async (id: string, status: string) => {
    // If setting to lunas, open payment modal instead
    if (status === 'lunas') {
      const transaksi = transaksiList.find((t) => t.id === id);
      if (transaksi) {
        setSelectedTransaksiForPayment(transaksi);
        setPaymentModalOpen(true);
        // Close action modal if open
        if (actionModalOpen) {
          closeActionModal();
        }
      }
      return;
    }

    // For other status updates, use the old method
    try {
      const { error } = await supabase
        .from('transaksi_laundry')
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

  const handlePaymentSuccess = async () => {
    await loadTransaksi();
    if (onUpdate) onUpdate();

    // Check if transaction is completed and paid, then close modal
    if (selectedTransaksiForPayment) {
      // CALCULATE POINTS AND UPDATE LEVEL
      try {
        // 1. Get full transaction details to ensure we have customer ID and total
        const { data: trx } = await supabase
          .from('transaksi_laundry')
          .select('*')
          .eq('id', selectedTransaksiForPayment.id)
          .single();

        if (trx && trx.id_pelanggan && trx.status_pembayaran === 'lunas') {
          // 2. Calculate points earned
          // Check if points already earned? 'poin_earned' column might be 0 or null.
          // If we assume this handler is ONLY called when it transitions to 'lunas' for the first time...
          // checking poin_earned > 0 might prevent double counting, but let's assume valid flow.

          // Fetch customer
          const { data: cust } = await supabase.from('pelanggan_laundry').select('id, poin, membership_level').eq('id', trx.id_pelanggan).single();

          if (cust) {
            const currentLevel = cust.membership_level || 'Bronze';
            const total = trx.total;

            // Calculate points
            const basePoints = Math.floor(total / 1000) * 20;
            let multiplier = 1;
            if (currentLevel === 'Silver') multiplier = 1.3;
            if (currentLevel === 'Gold') multiplier = 1.69;
            if (currentLevel === 'Platinum') multiplier = 2.197;

            const earned = Math.floor(basePoints * multiplier);

            // Only add points if not already added? 
            // We can check if `poin_earned` in transaction is 0. 
            if (trx.poin_earned === 0) {
              const newPoinBalance = (cust.poin || 0) + earned;

              // Calculate new level
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

              const { data: transData } = await supabase
                .from('transaksi_laundry')
                .select('total')
                .eq('id_pelanggan', cust.id)
                .gte('created_at', firstDay)
                .eq('status_pembayaran', 'lunas');

              const currentMonthTotal = (transData?.reduce((acc, t) => acc + t.total, 0) || 0); // trx.total is already in transData if we queried after update? Yes likely.

              let newLevel = 'Bronze';
              if (currentMonthTotal >= 1000000) newLevel = 'Platinum';
              else if (currentMonthTotal >= 500000) newLevel = 'Gold';
              else if (currentMonthTotal >= 200000) newLevel = 'Silver';

              // Update customer
              await supabase.from('pelanggan_laundry').update({
                poin: newPoinBalance,
                membership_level: newLevel
              }).eq('id', cust.id);

              // Update transaction with earned points
              await supabase.from('transaksi_laundry').update({ poin_earned: earned }).eq('id', trx.id);

              console.log(`Points added: ${earned}, New Level: ${newLevel}`);
            }
          }
        }

        // Close modal if fully completed
        const { data: updatedData } = await supabase
          .from('transaksi_laundry')
          .select('status_transaksi, status_pembayaran')
          .eq('id', selectedTransaksiForPayment.id)
          .single();

        if (updatedData && updatedData.status_transaksi === 'selesai' && updatedData.status_pembayaran === 'lunas') {
          closeActionModal();
        }
      } catch (err) {
        console.error("Error updating points in dashboard:", err);
      }
    }
  };

  const deleteTransaksi = async (id: string) => {
    const confirmed = confirm('Apakah Anda yakin ingin menghapus pesanan ini?');
    if (!confirmed) return false;

    try {
      const { error } = await supabase
        .from('transaksi_laundry')
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
      case 'penjemputan':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'terkirim':
        return 'bg-blue-100 text-blue-800 border-blue-300';
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold text-xs sm:text-sm">Kode</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Pelanggan</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Layanan</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm hidden lg:table-cell">Jumlah</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Total</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Status</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm hidden md:table-cell">Pembayaran</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm hidden lg:table-cell">Deadline</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm hidden lg:table-cell">Bukti</TableHead>
            <TableHead className="font-semibold text-right text-xs sm:text-sm">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transaksiList.map((transaksi) => (
            <TableRow key={transaksi.id} className="hover:bg-gray-50">
              <TableCell className="font-mono font-medium text-xs sm:text-sm">{transaksi.kode_struk}</TableCell>
              <TableCell className="text-xs sm:text-sm">{transaksi.nama_pelanggan}</TableCell>
              <TableCell className="hidden md:table-cell text-xs sm:text-sm">{transaksi.nama_layanan}</TableCell>
              <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{transaksi.jumlah}</TableCell>
              <TableCell className="font-semibold text-xs sm:text-sm">
                Rp {transaksi.total.toLocaleString('id-ID')}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-[10px] sm:text-xs ${getStatusColor(transaksi.status_transaksi)}`}>
                  {transaksi.status_transaksi.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className={`text-[10px] sm:text-xs ${getPembayaranColor(transaksi.status_pembayaran)}`}>
                  {transaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center text-xs sm:text-sm">
                  <span className={getDeadlineStyle(transaksi.deadline, transaksi.status_transaksi)}>
                    {format(new Date(transaksi.deadline), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                  </span>
                  {getDeadlineBadge(transaksi.deadline, transaksi.status_transaksi)}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {transaksi.bukti_pembayaran_url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProofUrl(transaksi.bukti_pembayaran_url || null);
                      setProofModalOpen(true);
                    }}
                    className="h-8 text-blue-600 hover:text-blue-700"
                  >
                    <FileImage className="h-4 w-4 mr-1" />
                    Lihat
                  </Button>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
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
                    {transaksi.status_transaksi === 'penjemputan' && (
                      <DropdownMenuItem onClick={() => updateStatus(transaksi.id, 'antrian')}>
                        Terima & Masuk Antrian
                      </DropdownMenuItem>
                    )}
                    {transaksi.status_transaksi === 'antrian' && (
                      <DropdownMenuItem onClick={() => updateStatus(transaksi.id, 'proses')}>
                        Set Proses
                      </DropdownMenuItem>
                    )}
                    {transaksi.status_transaksi === 'proses' && (
                      <DropdownMenuItem onClick={() => updateStatus(transaksi.id, 'selesai')}>
                        Set Selesai
                      </DropdownMenuItem>
                    )}
                    {transaksi.status_transaksi === 'selesai' && (
                      <DropdownMenuItem onClick={() => updateStatus(transaksi.id, 'terkirim')}>
                        Set Terkirim
                      </DropdownMenuItem>
                    )}
                    {transaksi.status_pembayaran !== 'lunas' && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTransaksiForPayment(transaksi);
                          setPaymentModalOpen(true);
                        }}
                      >
                        Tandai Lunas
                      </DropdownMenuItem>
                    )}
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ fontSize: '12px' }}>
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

      {selectedTransaksiForPayment && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedTransaksiForPayment(null);
          }}
          transaksiId={selectedTransaksiForPayment.id}
          total={selectedTransaksiForPayment.total}
          onSuccess={handlePaymentSuccess}
        />
      )}

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
            <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Kelola Pesanan</DialogTitle>
              </DialogHeader>
              {activeTransaksi && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">Kode</span>
                      <span className="font-mono text-sm sm:text-lg font-semibold text-gray-900 break-all text-right ml-2">
                        {activeTransaksi.kode_struk}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <span>Pelanggan</span>
                      <span className="font-semibold text-gray-900 text-right break-words ml-2">
                        {activeTransaksi.nama_pelanggan}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <span>Layanan</span>
                      <span className="font-semibold text-gray-900 text-right break-words ml-2">
                        {activeTransaksi.nama_layanan} &middot; {activeTransaksi.jumlah}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <span>Total</span>
                      <span className="font-semibold text-gray-900">
                        Rp {activeTransaksi.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <span>Status</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] sm:text-xs ${getStatusColor(activeTransaksi.status_transaksi)}`}
                      >
                        {activeTransaksi.status_transaksi.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      <span>Pembayaran</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] sm:text-xs ${getPembayaranColor(activeTransaksi.status_pembayaran)}`}
                      >
                        {activeTransaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                      </Badge>
                    </div>
                    {activeTransaksi.metode_pembayaran && (
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                        <span>Metode</span>
                        <span className="font-semibold text-gray-900 capitalize text-right break-words ml-2">
                          {activeTransaksi.metode_pembayaran.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {activeTransaksi.bukti_pembayaran_url && (
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                        <span>Bukti Pembayaran</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProofUrl(activeTransaksi.bukti_pembayaran_url || null);
                            setProofModalOpen(true);
                          }}
                          className="h-8 sm:h-9 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                        >
                          <FileImage className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Lihat Bukti
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleNavigate(`/transaksi/${activeTransaksi.id}`)} className="h-11 sm:h-10 text-sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </Button>
                    <Button variant="outline" onClick={() => handleNavigate(`/struk/${activeTransaksi.kode_struk}`)} className="h-11 sm:h-10 text-sm">
                      <Printer className="mr-2 h-4 w-4" />
                      Cetak Struk
                    </Button>
                    <Button variant="outline" onClick={() => handleNavigate(`/qr/${activeTransaksi.kode_struk}`)} className="h-11 sm:h-10 text-sm">
                      <QrCode className="mr-2 h-4 w-4" />
                      Lihat QR
                    </Button>
                    {activeTransaksi.status_pembayaran !== 'lunas' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTransaksiForPayment(activeTransaksi);
                          setPaymentModalOpen(true);
                          closeActionModal();
                        }}
                        className="h-11 sm:h-10 text-sm"
                      >
                        Tandai Lunas
                      </Button>
                    )}
                    {activeTransaksi.status_transaksi === 'penjemputan' && (
                      <Button variant="outline" onClick={() => updateStatus(activeTransaksi.id, 'antrian')} className="h-11 sm:h-10 text-sm">
                        Terima & Antrian
                      </Button>
                    )}
                    {activeTransaksi.status_transaksi === 'antrian' && (
                      <Button variant="outline" onClick={() => updateStatus(activeTransaksi.id, 'proses')} className="h-11 sm:h-10 text-sm">
                        Set Proses
                      </Button>
                    )}
                    {activeTransaksi.status_transaksi === 'proses' && (
                      <Button variant="outline" onClick={() => updateStatus(activeTransaksi.id, 'selesai')} className="h-11 sm:h-10 text-sm">
                        Set Selesai
                      </Button>
                    )}
                    {activeTransaksi.status_transaksi === 'selesai' && (
                      <Button variant="outline" onClick={() => updateStatus(activeTransaksi.id, 'terkirim')} className="h-11 sm:h-10 text-sm">
                        Set Terkirim
                      </Button>
                    )}
                    <Button variant="destructive" onClick={handleDeleteFromModal} className="h-11 sm:h-10 text-sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus Pesanan
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Proof Modal */}
          <Dialog open={proofModalOpen} onOpenChange={setProofModalOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bukti Pembayaran</DialogTitle>
              </DialogHeader>
              {selectedProofUrl && (
                <div className="space-y-4">
                  {selectedProofUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <iframe
                        src={selectedProofUrl}
                        className="w-full h-[600px] rounded"
                        title="Bukti Pembayaran PDF"
                      />
                      <div className="mt-4 flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedProofUrl, '_blank')}
                          className="flex-1"
                        >
                          Buka di Tab Baru
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = selectedProofUrl;
                            link.download = 'bukti-pembayaran.pdf';
                            link.click();
                          }}
                          className="flex-1"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={selectedProofUrl}
                          alt="Bukti Pembayaran"
                          className="w-full h-auto max-h-[600px] object-contain"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => window.open(selectedProofUrl, '_blank')}
                          className="flex-1"
                        >
                          Buka di Tab Baru
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = selectedProofUrl;
                            link.download = 'bukti-pembayaran.jpg';
                            link.click();
                          }}
                          className="flex-1"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}


