'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentModal } from '@/components/transaksi/PaymentModal';
import { Checkbox } from '@/components/ui/checkbox';

interface Layanan {
  id: string;
  nama: string;
  jenis_layanan: string;
  harga: number;
  durasi_pengerjaan_jam: number;
}

interface OrderItem {
  id: string;
  layanan: Layanan | null;
  jumlah: string;
}

const createEmptyItem = (): OrderItem => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(),
  layanan: null,
  jumlah: '1',
});

export default function CreateTransaksi() {
  const router = useRouter();
  const { user } = useAuth();
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([createEmptyItem()]);
  const [formData, setFormData] = useState({
    nama_pelanggan: '',
    nomor_hp: '',
    alamat: '',
  });
  const [bayarLangsung, setBayarLangsung] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createdTransaksiId, setCreatedTransaksiId] = useState<string | null>(null);
  const [totalPembayaran, setTotalPembayaran] = useState(0);
  const [kodeStrukForPayment, setKodeStrukForPayment] = useState<string | null>(null);

  useEffect(() => {
    loadLayanan();
  }, []);

  // Auto-fill pelanggan ketika nomor HP diisi
  useEffect(() => {
    const fetchPelanggan = async () => {
      const nomorHp = formData.nomor_hp.trim();

      if (nomorHp.length < 10) {
        if (formData.nama_pelanggan || formData.alamat) {
          setFormData((prev) => ({
            ...prev,
            nama_pelanggan: '',
            alamat: '',
          }));
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pelanggan')
          .select('nama, alamat')
          .eq('nomor_hp', nomorHp)
          .maybeSingle();

        if (error) {
          console.error('Error fetching pelanggan:', error);
          return;
        }

        if (data) {
          setFormData((prev) => {
            const shouldUpdate =
              prev.nama_pelanggan !== data.nama || prev.alamat !== (data.alamat || '');
            if (shouldUpdate) {
              if (!prev.nama_pelanggan) {
                toast.success(`Pelanggan ditemukan: ${data.nama}`);
              }
              return {
                ...prev,
                nama_pelanggan: data.nama,
                alamat: data.alamat || '',
              };
            }
            return prev;
          });
        } else {
          setFormData((prev) => {
            if (prev.nama_pelanggan || prev.alamat) {
              return {
                ...prev,
                nama_pelanggan: '',
                alamat: '',
              };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Error fetching pelanggan:', err);
      }
    };

    const timer = setTimeout(() => {
      fetchPelanggan();
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.nomor_hp]);

  const loadLayanan = async () => {
    const { data } = await supabase
      .from('layanan')
      .select('*')
      .order('nama');

    if (data) {
      setLayananList(data);
    }
  };

  const generateKodeStruk = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LND${year}${month}${day}${random}`;
  };

  const handleItemLayananChange = (itemId: string, layananId: string) => {
    const layanan = layananList.find((l) => l.id === layananId) || null;
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, layanan } : item))
    );
  };

  const handleJumlahChange = (itemId: string, jumlah: string) => {
    if (parseInt(jumlah, 10) < 0) return;
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, jumlah } : item))
    );
  };

  const handleAddItem = () => {
    setOrderItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const grandTotal = orderItems.reduce((acc, item) => {
    if (!item.layanan) return acc;
    const qty = parseInt(item.jumlah || '0', 10);
    if (Number.isNaN(qty)) return acc;
    return acc + item.layanan.harga * qty;
  }, 0);

  const allItemsValid =
    orderItems.length > 0 &&
    orderItems.every((item) => item.layanan && parseInt(item.jumlah || '0', 10) > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allItemsValid) {
      toast.error('Pastikan setiap pesanan memiliki layanan dan jumlah yang valid');
      return;
    }

    try {
      const kodeStruk = generateKodeStruk();
      const nomorHp = formData.nomor_hp.trim();

      let pelangganId: string | null = null;

      const { data: existingPelanggan, error: errorPelangganCek } = await supabase
        .from('pelanggan')
        .select('id, nama, alamat')
        .eq('nomor_hp', nomorHp)
        .maybeSingle();

      if (errorPelangganCek) {
        console.error('Error checking pelanggan:', errorPelangganCek);
        toast.error('Gagal mengecek data pelanggan: ' + errorPelangganCek.message);
        return;
      }

      if (existingPelanggan) {
        pelangganId = existingPelanggan.id;

        if (
          existingPelanggan.nama !== formData.nama_pelanggan ||
          (existingPelanggan.alamat || '') !== formData.alamat
        ) {
          const { error: errorUpdatePelanggan } = await supabase
            .from('pelanggan')
            .update({
              nama: formData.nama_pelanggan,
              alamat: formData.alamat,
            })
            .eq('id', pelangganId);

          if (errorUpdatePelanggan) {
            console.error('Error updating pelanggan:', errorUpdatePelanggan);
            toast.error('Gagal memperbarui data pelanggan: ' + errorUpdatePelanggan.message);
            return;
          }
        }
      } else {
        const { data: newPelanggan, error: errorInsertPelanggan } = await supabase
          .from('pelanggan')
          .insert([
            {
              nama: formData.nama_pelanggan,
              nomor_hp: nomorHp,
              alamat: formData.alamat,
            },
          ])
          .select()
          .single();

        if (errorInsertPelanggan) {
          console.error('Error inserting pelanggan:', errorInsertPelanggan);
          toast.error('Gagal menambahkan pelanggan: ' + errorInsertPelanggan.message);
          return;
        }

        if (newPelanggan) {
          pelangganId = newPelanggan.id;
        }
      }

      const transaksiPayload = orderItems.map((item) => {
        const layanan = item.layanan!;
        const jumlah = parseInt(item.jumlah, 10);
        const total = layanan.harga * jumlah;
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + layanan.durasi_pengerjaan_jam);

        return {
          kode_struk: kodeStruk,
          id_pelanggan: pelangganId,
          id_users: user?.id || null,
          id_layanan: layanan.id,
          nama_layanan: layanan.nama,
          nama_pelanggan: formData.nama_pelanggan,
          alamat_pelanggan: formData.alamat,
          jumlah,
          harga_layanan: layanan.harga,
          total,
          status_transaksi: 'antrian',
          status_pembayaran: 'belum_lunas',
          deadline: deadline.toISOString(),
        };
      });

      const { data: insertedData, error } = await supabase
        .from('transaksi')
        .insert(transaksiPayload)
        .select('id');

      if (error) {
        console.error('Error inserting transaksi:', error);
        toast.error('Gagal membuat pesanan: ' + error.message);
        return;
      }

      if (!insertedData || insertedData.length === 0) {
        toast.error('Gagal membuat pesanan: Tidak ada data yang dibuat');
        return;
      }

      toast.success('Pesanan berhasil dibuat!');
      window.dispatchEvent(new Event('transaksi-updated'));

      // Calculate total payment
      const total = transaksiPayload.reduce((sum, item) => sum + item.total, 0);

      // If bayar langsung, open payment modal
      if (bayarLangsung) {
        setCreatedTransaksiId(insertedData[0].id); // Use first transaction ID for payment modal
        setKodeStrukForPayment(kodeStruk);
        setTotalPembayaran(total);
        setPaymentModalOpen(true);
      } else {
        router.push(`/struk/${kodeStruk}`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="bg-blue-600 text-white p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">Buat Pesanan Baru</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-6">
                  {orderItems.map((item, index) => {
                    const layanan = item.layanan;
                    const jumlah = parseInt(item.jumlah || '0', 10);
                    const subtotal =
                      layanan && !Number.isNaN(jumlah) ? layanan.harga * jumlah : 0;

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3 sm:mb-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            Pesanan #{index + 1}
                          </h3>
                          {orderItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-700 h-8 sm:h-9"
                            >
                              <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Hapus</span>
                            </Button>
                          )}
                        </div>

                        <div className="mt-3 sm:mt-4 grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-[1.6fr_1fr]">
                          <div>
                            <Label className="text-sm sm:text-base font-semibold">Pilih Layanan *</Label>
                            <Select
                              value={layanan?.id}
                              onValueChange={(value) => handleItemLayananChange(item.id, value)}
                              required
                            >
                              <SelectTrigger className="mt-2 h-11 sm:h-10">
                                <SelectValue placeholder="Pilih layanan..." />
                              </SelectTrigger>
                              <SelectContent>
                                {layananList.map((layananOption) => (
                                  <SelectItem key={layananOption.id} value={layananOption.id}>
                                    {layananOption.nama} - Rp{' '}
                                    {layananOption.harga.toLocaleString('id-ID')} (
                                    {layananOption.jenis_layanan}) •{' '}
                                    {layananOption.durasi_pengerjaan_jam} jam
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm sm:text-base font-semibold">Jumlah *</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.jumlah}
                              onChange={(e) => handleJumlahChange(item.id, e.target.value)}
                              required
                              className="flex-1 h-11 sm:h-10"
                              inputMode="numeric"
                            />
                            <div className="flex flex-wrap gap-1">
                              {[1, 2, 3, 4, 5].map((increment) => (
                                <Button
                                  key={increment}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                                  onClick={() => {
                                    const current = parseInt(item.jumlah || '0', 10);
                                    const nextValue = Number.isNaN(current)
                                      ? increment
                                      : Math.max(1, current + increment);
                                    handleJumlahChange(item.id, String(nextValue));
                                  }}
                                >
                                  +{increment}
                                </Button>
                              ))}
                            </div>
                          </div>
                          </div>
                        </div>

                        {layanan && (
                          <div className="mt-3 sm:mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-blue-900">
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              <div className="flex flex-col">
                                <span className="text-blue-600 text-[10px] sm:text-xs uppercase tracking-wide">
                                  Jenis
                                </span>
                                <span className="font-semibold uppercase text-blue-900 text-xs sm:text-sm">
                                  {layanan.jenis_layanan}
                                </span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-blue-600 text-[10px] sm:text-xs uppercase tracking-wide">
                                  Harga
                                </span>
                                <span className="font-semibold text-blue-900 text-xs sm:text-sm">
                                  Rp {layanan.harga.toLocaleString('id-ID')}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-blue-600 text-[10px] sm:text-xs uppercase tracking-wide">
                                  Durasi
                                </span>
                                <span className="font-semibold text-blue-900 text-xs sm:text-sm">
                                  {layanan.durasi_pengerjaan_jam} jam
                                </span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-blue-600 text-[10px] sm:text-xs uppercase tracking-wide">
                                  Subtotal
                                </span>
                                <span className="font-semibold text-blue-900 text-xs sm:text-sm">
                                  Rp {subtotal.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddItem}
                    className="w-full border-dashed border-2 py-4 sm:py-6 text-blue-600 hover:text-blue-700 h-auto"
                  >
                    <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Tambah Layanan
                  </Button>
                </div>

                {grandTotal > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-semibold uppercase text-green-700">
                        Total Estimasi
                      </span>
                      <span className="text-lg sm:text-2xl font-bold text-green-800">
                        Rp {grandTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] sm:text-xs text-green-700">
                      Semua pesanan akan menggunakan kode struk yang sama dan tampil sebagai satu
                      struk.
                    </p>
                  </div>
                )}

                <div className="border-t pt-3 sm:pt-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Data Pelanggan</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nomor_hp" className="text-sm sm:text-base">Nomor WhatsApp *</Label>
                      <div className="relative mt-2">
                        <Input
                          id="nomor_hp"
                          type="tel"
                          value={formData.nomor_hp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setFormData({ ...formData, nomor_hp: value });
                          }}
                          required
                          placeholder="08123456789"
                          className="pr-10 h-11 sm:h-10"
                          inputMode="tel"
                        />
                        {formData.nama_pelanggan && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Masukkan nomor WhatsApp untuk mengecek apakah pelanggan sudah terdaftar
                      </p>
                      {formData.nama_pelanggan && formData.nomor_hp.length >= 10 && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Pelanggan ditemukan: {formData.nama_pelanggan}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="nama_pelanggan" className="text-sm sm:text-base">Nama Pelanggan *</Label>
                      <Input
                        id="nama_pelanggan"
                        value={formData.nama_pelanggan}
                        onChange={(e) => setFormData({ ...formData, nama_pelanggan: e.target.value })}
                        required
                        placeholder="Nama akan terisi otomatis jika pelanggan sudah terdaftar"
                        className="mt-2 h-11 sm:h-10"
                      />
                      {formData.nama_pelanggan && formData.nomor_hp.length >= 10 && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Nama diisi otomatis dari database. Anda bisa mengedit jika perlu.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="alamat" className="text-sm sm:text-base">Alamat</Label>
                      <Input
                        id="alamat"
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        placeholder="Alamat akan terisi otomatis jika pelanggan sudah terdaftar"
                        className="mt-2 h-11 sm:h-10"
                      />
                      {formData.alamat && formData.nomor_hp.length >= 10 && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Alamat diisi otomatis dari database. Anda bisa mengedit jika perlu.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bayar Langsung Option */}
              <div className="flex items-center space-x-2 p-3 sm:p-4 border rounded-lg bg-gray-50">
                <Checkbox
                  id="bayar-langsung"
                  checked={bayarLangsung}
                  onCheckedChange={(checked) => setBayarLangsung(checked === true)}
                />
                <Label
                  htmlFor="bayar-langsung"
                  className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Bayar langsung setelah pesanan dibuat
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 sm:h-12 text-base sm:text-lg"
                  disabled={!allItemsValid}
                >
                  Buat Pesanan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="h-11 sm:h-12"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {createdTransaksiId && (
          <PaymentModal
            open={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              if (kodeStrukForPayment) {
                router.push(`/struk/${kodeStrukForPayment}`);
              }
            }}
            transaksiId={createdTransaksiId}
            total={totalPembayaran}
            onSuccess={async () => {
              // Update all transactions with the same kode_struk
              if (kodeStrukForPayment) {
                const { error } = await supabase
                  .from('transaksi')
                  .update({ status_pembayaran: 'lunas' })
                  .eq('kode_struk', kodeStrukForPayment)
                  .eq('status_pembayaran', 'belum_lunas');

                if (error) {
                  console.error('Error updating payment status:', error);
                  toast.error('Gagal memperbarui status pembayaran: ' + error.message);
                } else {
                  window.dispatchEvent(new Event('transaksi-updated'));
                  setPaymentModalOpen(false);
                  router.push(`/struk/${kodeStrukForPayment}`);
                }
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
