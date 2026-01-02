'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, MapPin, Phone, Shirt, Info } from 'lucide-react';
import LocationPicker from '@/components/map/LocationPicker';

interface Layanan {
    id: string;
    nama: string;
    jenis_layanan: string;
    harga: number;
}

interface BookingFormProps {
    layananList: Layanan[];
    preSelectedLayananId?: string;
}

export default function BookingForm({ layananList, preSelectedLayananId }: BookingFormProps) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nomor_hp: '',
        nama_pelanggan: '',
        alamat: '',
        layanan_id: preSelectedLayananId || '',
        catatan: '',
        jumlah_estimasi: '1',
    });



    const [customerFound, setCustomerFound] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [outletLocation, setOutletLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [distance, setDistance] = useState<number>(0);
    const [deliveryFee, setDeliveryFee] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    // Fetch outlet location
    useEffect(() => {
        const fetchOutlet = async () => {
            const { data } = await supabase.from('outlet_settings').select('*').maybeSingle();
            if (data) {
                setOutletLocation({ lat: data.latitude, lng: data.longitude });
            } else {
                // Fallback / Default
                setOutletLocation({ lat: -6.175392, lng: 106.827153 });
            }
        };
        fetchOutlet();
    }, []);

    // Calculate distance and fee when location changes
    useEffect(() => {
        if (selectedLocation && outletLocation) {
            const calculatedDistance = calculateDistance(
                outletLocation.lat,
                outletLocation.lng,
                selectedLocation.lat,
                selectedLocation.lng
            );
            setDistance(calculatedDistance);

            // Fee Logic: 0-3km = Free, 3-6km = 8000, >6km = Block
            let fee = 0;
            if (calculatedDistance > 3 && calculatedDistance <= 6) {
                fee = 8000;
            }
            // If > 6km, we don't set a fee because we block it.
            setDeliveryFee(fee);
        }
    }, [selectedLocation, outletLocation]);

    // Update total price
    useEffect(() => {
        const selectedLayanan = layananList.find(l => l.id === formData.layanan_id);
        const hargaItems = selectedLayanan ? selectedLayanan.harga * parseInt(formData.jumlah_estimasi || '0') : 0;
        setTotalPrice(hargaItems + deliveryFee);
    }, [formData.layanan_id, formData.jumlah_estimasi, deliveryFee, layananList]);

    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return Math.round(d * 100) / 100;
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }

    // Update form when preSelectedLayananId changes
    useEffect(() => {
        if (preSelectedLayananId) {
            setFormData(prev => ({ ...prev, layanan_id: preSelectedLayananId }));
        }
    }, [preSelectedLayananId]);

    // Auto-check customer
    useEffect(() => {
        const checkCustomer = async () => {
            const hp = formData.nomor_hp.trim();
            if (hp.length < 10) return;

            const { data } = await supabase
                .from('pelanggan')
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
                .from('pelanggan')
                .select('id')
                .eq('nomor_hp', formData.nomor_hp)
                .maybeSingle();

            if (existingCust) {
                pelangganId = existingCust.id;
                if (formData.alamat) {
                    await supabase.from('pelanggan').update({ alamat: formData.alamat }).eq('id', pelangganId);
                }
            } else {
                const { data: newCust, error: createError } = await supabase
                    .from('pelanggan')
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

            // 2. Generate Kode Struk
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
            const estimasiTotal = selectedLayanan.harga * jumlah;

            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 1);

            const { error: transError } = await supabase.from('transaksi').insert([{
                kode_struk: kodeStruk,
                id_pelanggan: pelangganId,
                id_layanan: selectedLayanan.id,
                nama_layanan: selectedLayanan.nama,
                nama_pelanggan: formData.nama_pelanggan,
                alamat_pelanggan: formData.alamat,
                jumlah: jumlah,
                harga_layanan: selectedLayanan.harga,
                // total: estimasiTotal, // Overridden below
                status_transaksi: 'penjemputan',
                status_pembayaran: 'belum_lunas',
                deadline: deadline.toISOString(),
                poin_used: 0,
                // New Fields
                latitude: selectedLocation?.lat,
                longitude: selectedLocation?.lng,
                jarak_km: distance,
                ongkos_kirim: deliveryFee,
                total: totalPrice // Override estimate with total including fee
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
        <Card className="shadow-xl boundary-card">
            <CardHeader className="text-center">

                <CardTitle className="text-2xl font-bold">Form Pemesanan Online</CardTitle>
                <CardDescription>
                    Isi data diri Anda untuk pemesanan layanan antar-jemput
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
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
                                className="pl-10 h-12 text-lg"
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



                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <Label className="text-base font-semibold text-gray-700">Pin Lokasi Penjemputan</Label>
                            </div>
                            <LocationPicker
                                onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
                                selectedLocation={selectedLocation}
                                outletLocation={outletLocation}
                            />
                            {distance > 6 ? (
                                <div className="mt-2 p-3 rounded-md bg-red-50 border border-red-100 flex items-start gap-3">
                                    <div className="bg-red-100 p-1.5 rounded-full shrink-0">
                                        <Info className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-red-700">Lokasi Terlalu Jauh ({distance} km)</p>
                                        <p className="text-red-600 mt-1">
                                            Maaf, layanan penjemputan kami hanya tersedia dalam radius maksimal 6 km dari outlet.
                                            Silakan hubungi admin untuk konfirmasi lebih lanjut.
                                        </p>
                                    </div>
                                </div>
                            ) : distance > 0 && (
                                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md text-sm">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <span className="text-gray-700">Jarak ke Outlet: <b>{distance} km</b></span>
                                    </div>
                                    <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                        Ongkir: {deliveryFee === 0 ? 'GRATIS' : `Rp ${deliveryFee.toLocaleString()}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alamat">Alamat Lengkap</Label>
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

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                            <span className="font-semibold text-gray-600">Estimasi Total:</span>
                            <span className="text-xl font-bold text-blue-600">Rp {totalPrice.toLocaleString()}</span>
                        </div>
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

                    <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading || distance > 6}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Pesan Penjemputan'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
