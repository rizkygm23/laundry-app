'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Phone, Shirt } from 'lucide-react';
import Link from 'next/link';

interface Layanan {
    id: string;
    nama: string;
    jenis_layanan: string;
    harga: number;
}

function BookingForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialLayananId = searchParams.get('layanan_id');

    const [loading, setLoading] = useState(false);
    const [layananList, setLayananList] = useState<Layanan[]>([]);
    const [formData, setFormData] = useState({
        nomor_hp: '',
        nama_pelanggan: '',
        alamat: '',
        layanan_id: initialLayananId || '',
        catatan: '',
        jumlah_estimasi: '1',
    });

    const [customerFound, setCustomerFound] = useState(false);

    useEffect(() => {
        loadLayanan();
    }, []);

    const loadLayanan = async () => {
        const { data } = await supabase.from('layanan_laundry').select('*').order('nama');
        if (data) setLayananList(data);
    };

    // Auto-check customer
    useEffect(() => {
        const checkCustomer = async () => {
            const hp = formData.nomor_hp.trim();
            if (hp.length < 10) return;

            const { data } = await supabase
                .from('pelanggan_laundry')
                .select('nama, alamat')
                .eq('nomor_hp', hp)
                .maybeSingle();

            if (data) {
                setFormData(prev => ({
                    ...prev,
                    nama_pelanggan: data.nama,
                    alamat: data.alamat || prev.alamat,
                }));
                setCustomerFound(true);
                toast.success(`Selamat datang kembali, ${data.nama}!`);
            } else {
                setCustomerFound(false);
            }
        };

        const timer = setTimeout(checkCustomer, 800);
        return () => clearTimeout(timer);
    }, [formData.nomor_hp]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Handle Customer (Find or Create)
            let pelangganId;
            const { data: existingCust } = await supabase
                .from('pelanggan_laundry')
                .select('id')
                .eq('nomor_hp', formData.nomor_hp)
                .maybeSingle();

            if (existingCust) {
                pelangganId = existingCust.id;
                // Optional: Update address if changed? Let's just keep existing or maybe update.
                // For simplicity in booking, we assume we update address if provided
                if (formData.alamat) {
                    await supabase.from('pelanggan_laundry').update({ alamat: formData.alamat }).eq('id', pelangganId);
                }
            } else {
                const { data: newCust, error: createError } = await supabase
                    .from('pelanggan_laundry')
                    .insert([{
                        nama: formData.nama_pelanggan,
                        nomor_hp: formData.nomor_hp,
                        alamat: formData.alamat,
                        membership_level: 'Bronze',
                        poin: 0
                    }])
                    .select()
                    .single();

                if (createError) throw new Error('Gagal mendaftar pelanggan: ' + createError.message);
                pelangganId = newCust.id;
            }

            // 2. Generate Kode Struk (Temporary or Real?)
            // We should probably generate a real one to track it.
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const kodeStruk = `OL${year}${month}${day}${random}`; // OL for Online

            // 3. Create Transaction
            const selectedLayanan = layananList.find(l => l.id === formData.layanan_id);
            if (!selectedLayanan) throw new Error('Layanan tidak valid');

            const jumlah = parseInt(formData.jumlah_estimasi);
            // Estimation total, but real price determined later
            const estimasiTotal = selectedLayanan.harga * jumlah;

            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 1); // Default 1 day deadline placeholder

            const { error: transError } = await supabase.from('transaksi_laundry').insert([{
                kode_struk: kodeStruk,
                id_pelanggan: pelangganId,
                id_layanan: selectedLayanan.id,
                nama_layanan: selectedLayanan.nama,
                nama_pelanggan: formData.nama_pelanggan,
                alamat_pelanggan: formData.alamat,
                jumlah: jumlah,
                harga_layanan: selectedLayanan.harga,
                total: estimasiTotal,
                status_transaksi: 'penjemputan', // NEW STATUS
                status_pembayaran: 'belum_lunas',
                deadline: deadline.toISOString(),
                poin_earned: 0,
                poin_used: 0
            }]);

            if (transError) throw new Error('Gagal membuat pesanan: ' + transError.message);

            toast.success('Pesanan berhasil dibuat! Tim kami akan segera menghubungi Anda.');
            router.push(`/booking/success?kode=${kodeStruk}`);

        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href="/">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
            </Link>

            <Card className="shadow-xl border-t-4 border-t-blue-600">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                        <Shirt className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Form Pemesanan Online</CardTitle>
                    <CardDescription>
                        Isi data diri Anda untuk pemesanan layanan antar-jemput
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Phone First */}
                        <div className="space-y-2">
                            <Label htmlFor="nomor_hp">Nomor WhatsApp (Wajib Diisi Pertama)</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <Input
                                    id="nomor_hp"
                                    type="tel"
                                    placeholder="08123456789"
                                    className="pl-10 h-12 text-lg" // Larger input for focus
                                    value={formData.nomor_hp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, nomor_hp: val });
                                    }}
                                    required
                                />
                            </div>
                            {customerFound && (
                                <p className="text-green-600 text-sm flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Data Anda ditemukan!
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Lengkap</Label>
                                <Input
                                    id="nama"
                                    placeholder="Nama Anda"
                                    value={formData.nama_pelanggan}
                                    onChange={(e) => setFormData({ ...formData, nama_pelanggan: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="layanan">Layanan</Label>
                                <Select
                                    value={formData.layanan_id}
                                    onValueChange={(val) => setFormData({ ...formData, layanan_id: val })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Layanan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {layananList.map((l) => (
                                            <SelectItem key={l.id} value={l.id}>
                                                {l.nama} - Rp {l.harga.toLocaleString()}/{l.jenis_layanan === 'kiloan' ? 'kg' : 'pcs'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">Alamat Penjemputan</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-gray-400">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <Textarea
                                    id="alamat"
                                    placeholder="Jl. Contoh No. 123, Kecamatan, Kota..."
                                    className="pl-10 min-h-[100px]"
                                    value={formData.alamat}
                                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jumlah">Perkiraan Jumlah ({formData.layanan_id ? layananList.find(l => l.id === formData.layanan_id)?.jenis_layanan === 'kiloan' ? 'Kg' : 'Pcs' : 'Unit'})</Label>
                            <Input
                                id="jumlah"
                                type="number"
                                min="1"
                                value={formData.jumlah_estimasi}
                                onChange={(e) => setFormData({ ...formData, jumlah_estimasi: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                *Jumlah pasti akan ditimbang/dihitung saat penjemputan oleh kurir kami.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
                            <Textarea
                                id="catatan"
                                placeholder="Contoh: Tolong jemput jam 10 pagi, atau rumah pagar warna hitam"
                                value={formData.catatan}
                                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Pesan Penjemputan'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function BookingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<div className="p-8 text-center">Loading form...</div>}>
                <BookingForm />
            </Suspense>
        </div>
    );
}
