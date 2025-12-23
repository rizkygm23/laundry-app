'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { getBaseUrl } from '@/lib/url';

export default function QRPage({ params }: { params: { kode: string } }) {
  const router = useRouter();
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    generateQRCode();
  }, [params.kode]);

  const generateQRCode = async () => {
    const url = `${getBaseUrl()}/status/${params.kode}`;
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
    });
    setQrCodeUrl(qrDataUrl);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `qr-${params.kode}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-4 sm:mb-6 no-print w-full sm:w-auto h-11 sm:h-10">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="shadow-xl print-content">
          <CardHeader className="bg-blue-600 text-white no-print p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-center">QR Code Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-xs sm:text-sm text-gray-600 mb-2">Kode Transaksi</div>
              <div className="text-lg sm:text-2xl font-mono font-bold text-gray-900 break-all">{params.kode}</div>
            </div>

            <div className="flex justify-center mb-4 sm:mb-6">
              {qrCodeUrl && (
                <div className="bg-white p-3 sm:p-6 rounded-lg shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 sm:w-80 sm:h-80" />
                </div>
              )}
            </div>

            <div className="text-center mb-4 sm:mb-6 no-print">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Scan QR code untuk cek status pesanan</p>
              <p className="text-[10px] sm:text-sm text-gray-500 break-all px-2">
                {getBaseUrl()}/status/{params.kode}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 no-print">
              <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700 h-11 sm:h-10">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              <Button onClick={handlePrint} variant="outline" className="flex-1 h-11 sm:h-10">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" onClick={() => router.push(`/struk/${params.kode}`)} className="flex-1 h-11 sm:h-10">
                Lihat Struk
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
