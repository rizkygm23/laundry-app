'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <CardTitle className="text-2xl text-center">QR Code Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">Kode Transaksi</div>
              <div className="text-2xl font-mono font-bold text-gray-900">{params.kode}</div>
            </div>

            <div className="flex justify-center mb-6">
              {qrCodeUrl && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-80 h-80" />
                </div>
              )}
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">Scan QR code untuk cek status pesanan</p>
              <p className="text-sm text-gray-500">
                {getBaseUrl()}/status/{params.kode}
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              <Button variant="outline" onClick={() => router.push(`/struk/${params.kode}`)} className="flex-1">
                Lihat Struk
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
