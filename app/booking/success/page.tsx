'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/url';

function SuccessContent() {
    const searchParams = useSearchParams();
    const kode = searchParams.get('kode');
    const router = useRouter();

    if (!kode) {
        return <div className="text-center p-8">Data tidak ditemukan</div>;
    }

    const handleWhatsapp = () => {
        const message = `Halo Necis Laundry, saya baru saja melakukan pemesanan online dengan kode: ${kode}. Mohon segera diproses untuk penjemputan.`;
        window.open(`https://wa.me/6281218582747?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <Card className="w-full shadow-xl text-center">
            <CardHeader>
                <div className="mx-auto bg-green-600 p-4 rounded-full w-fit mb-4">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">Pemesanan Berhasil!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Kode Pesanan Anda</p>
                    <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">{kode}</p>
                </div>

                <p className="text-gray-600">
                    Tim kami akan segera menghubungi Anda via WhatsApp untuk konfirmasi penjemputan.
                    Mohon pastikan nomor WhatsApp Anda aktif.
                </p>

                <div className="flex flex-col gap-3">
                    <Button onClick={handleWhatsapp} className="w-full bg-green-600 hover:bg-green-700 h-11">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Konfirmasi ke Admin via WA
                    </Button>

                    <Link href="/">
                        <Button variant="outline" className="w-full">
                            <Home className="mr-2 h-4 w-4" /> Kembali ke Depan
                        </Button>
                    </Link>

                    <Link href={`/status/${kode}`}>
                        <Button variant="ghost" className="w-full">
                            Cek Status Pesanan
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function BookingSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <Suspense fallback={<div>Loading...</div>}>
                    <SuccessContent />
                </Suspense>
            </div>
        </div>
    );
}
