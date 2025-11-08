'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, QrCode, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

interface TransaksiSearchProps {
  onSearch: (query: string, type: 'nama' | 'kode' | 'qr') => void;
  onClear: () => void;
}

export function TransaksiSearch({ onSearch, onClear }: TransaksiSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'nama' | 'kode'>('nama');
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef<string>(`qr-reader-${Date.now()}`);

  useEffect(() => {
    return () => {
      // Cleanup QR scanner on unmount
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(() => {});
        qrCodeRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), searchType);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClear();
  };

  const startQRScanner = async () => {
    try {
      setScanning(true);
      
      // Check if scanner already exists
      if (qrCodeRef.current) {
        await qrCodeRef.current.stop().catch(() => {});
        await qrCodeRef.current.clear().catch(() => {});
      }

      qrCodeRef.current = new Html5Qrcode(scannerIdRef.current);

      await qrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          handleQRScanned(decodedText);
        },
        (errorMessage) => {
          // Error callback - ignore scanning errors (will be called frequently)
        }
      );
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      if (err.message && !err.message.includes('Already starting')) {
        toast.error('Gagal memulai QR scanner: ' + err.message);
      }
      setScanning(false);
    }
  };

  const stopQRScanner = async () => {
    try {
      if (qrCodeRef.current) {
        await qrCodeRef.current.stop();
        await qrCodeRef.current.clear();
        qrCodeRef.current = null;
      }
      setScanning(false);
    } catch (err) {
      console.error('Error stopping QR scanner:', err);
    }
  };

  const handleQRScanned = (qrData: string) => {
    stopQRScanner();
    setQrScannerOpen(false);

    // Extract kode from QR data (format: /status/KODE or full URL)
    let kode = '';
    if (qrData.includes('/status/')) {
      kode = qrData.split('/status/')[1].split('?')[0].split('#')[0];
    } else if (qrData.match(/^LND\d{8}$/)) {
      // Direct kode format
      kode = qrData;
    } else {
      toast.error('QR Code tidak valid');
      return;
    }

    if (kode) {
      onSearch(kode, 'qr');
      toast.success('QR Code berhasil di-scan!');
    } else {
      toast.error('Format QR Code tidak dikenali');
    }
  };

  const handleQRScannerClose = () => {
    stopQRScanner();
    setQrScannerOpen(false);
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={
                searchType === 'nama'
                  ? 'Cari berdasarkan nama pelanggan...'
                  : 'Cari berdasarkan kode transaksi...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSearchType(searchType === 'nama' ? 'kode' : 'nama')}
            className="whitespace-nowrap"
          >
            {searchType === 'nama' ? 'Kode' : 'Nama'}
          </Button>
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="h-4 w-4" />
          </Button>
          {searchQuery && (
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setQrScannerOpen(true)}
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <QrCode className="h-4 w-4 mr-2" />
          Scan QR
        </Button>
      </div>

      <Dialog open={qrScannerOpen} onOpenChange={handleQRScannerClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              id={scannerIdRef.current}
              className="w-full rounded-lg overflow-hidden bg-gray-100"
              style={{ minHeight: '300px' }}
            />
            {!scanning && (
              <Button
                onClick={startQRScanner}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Mulai Scan
              </Button>
            )}
            {scanning && (
              <Button
                onClick={stopQRScanner}
                variant="destructive"
                className="w-full"
              >
                Stop Scan
              </Button>
            )}
            <p className="text-sm text-gray-500 text-center">
              Arahkan kamera ke QR Code pada struk transaksi
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

