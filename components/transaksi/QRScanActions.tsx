'use client';

import { Transaksi } from './transaksi-list';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Printer, QrCode, Package, CreditCard, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface QRScanActionsProps {
  transaksi: Transaksi | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: string) => void;
  onUpdatePembayaran?: (id: string, status: string) => void;
}

export function QRScanActions({
  transaksi,
  open,
  onClose,
  onUpdateStatus,
  onUpdatePembayaran,
}: QRScanActionsProps) {
  const router = useRouter();

  if (!transaksi) return null;

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transaksi Ditemukan</DialogTitle>
          <DialogDescription>
            Kode: <span className="font-mono font-bold">{transaksi.kode_struk}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaksi Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pelanggan:</span>
              <span className="text-sm font-medium">{transaksi.nama_pelanggan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Layanan:</span>
              <span className="text-sm font-medium">{transaksi.nama_layanan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant="outline" className={getStatusColor(transaksi.status_transaksi)}>
                {transaksi.status_transaksi.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pembayaran:</span>
              <Badge
                variant="outline"
                className={
                  transaksi.status_pembayaran === 'lunas'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {transaksi.status_pembayaran === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Deadline:</span>
              <span className="text-sm font-medium">
                {format(new Date(transaksi.deadline), 'dd MMM yyyy HH:mm', { locale: idLocale })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-sm font-bold text-blue-600">
                Rp {transaksi.total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Aksi Cepat:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  router.push(`/transaksi/${transaksi.id}`);
                  onClose();
                }}
                className="w-full"
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  router.push(`/struk/${transaksi.kode_struk}`);
                  onClose();
                }}
                className="w-full"
              >
                <Printer className="mr-2 h-4 w-4" />
                Cetak Struk
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  router.push(`/qr/${transaksi.kode_struk}`);
                  onClose();
                }}
                className="w-full"
              >
                <QrCode className="mr-2 h-4 w-4" />
                QR Code
              </Button>
            </div>
          </div>

          {/* Status Actions */}
          {transaksi.status_transaksi !== 'selesai' && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700">Update Status:</h3>
              <div className="grid grid-cols-2 gap-2">
                {transaksi.status_transaksi !== 'antrian' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateStatus?.(transaksi.id, 'antrian');
                      onClose();
                    }}
                  >
                    Set Antrian
                  </Button>
                )}
                {transaksi.status_transaksi !== 'proses' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateStatus?.(transaksi.id, 'proses');
                      onClose();
                    }}
                  >
                    <Package className="mr-1 h-3 w-3" />
                    Set Proses
                  </Button>
                )}
                {transaksi.status_transaksi === 'proses' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUpdateStatus?.(transaksi.id, 'selesai');
                      onClose();
                    }}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 col-span-2"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Set Selesai
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Payment Action */}
          {transaksi.status_pembayaran !== 'lunas' && (
            <div className="space-y-2 border-t pt-4">
              <Button
                onClick={() => {
                  onUpdatePembayaran?.(transaksi.id, 'lunas');
                  onClose();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Tandai Lunas
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

