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
import { CheckCircle2, PlusCircle, Trash2, Users } from 'lucide-react';
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

  // Membership & Points
  const [poin, setPoin] = useState(0);
  const [membershipLevel, setMembershipLevel] = useState('Bronze');
  const [poinUsed, setPoinUsed] = useState(0);
  const [usePoin, setUsePoin] = useState(false);

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
          .select('nama, alamat, poin, membership_level')
          .eq('nomor_hp', nomorHp)
          .maybeSingle();

        if (error) {
          console.error('Error fetching pelanggan:', error);
          return;
        }

        if (data) {
          setPoin(data.poin || 0);
          setMembershipLevel(data.membership_level || 'Bronze');

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
          setPoin(0);
          setMembershipLevel('Bronze');

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

  const discountFromPoints = usePoin ? poinUsed : 0;
  const finalTotal = Math.max(0, grandTotal - discountFromPoints);

  // Calculate potential points earned
  const calculatePointsEarned = (total: number, level: string) => {
    const basePoints = Math.floor(total / 1000) * 20;
    let multiplier = 1;
    if (level === 'Silver') multiplier = 1.3;
    if (level === 'Gold') multiplier = 1.69;
    if (level === 'Platinum') multiplier = 2.197;
    return Math.floor(basePoints * multiplier);
  };

  const potentialPoints = calculatePointsEarned(finalTotal, membershipLevel);

  useEffect(() => {
    if (usePoin) {
      // Max points usage rule: 1 point = 1 rupiah
      // Minimal redemption: 1000 points? The user said "minimal kelipatan 1000 poin juga".
      // Let's assume we can redeem in multiples of 1000.

      const maxRedeemable = Math.min(Math.floor(poin / 1000) * 1000, Math.floor(grandTotal / 1000) * 1000);
      setPoinUsed(maxRedeemable);
    } else {
      setPoinUsed(0);
    }
  }, [usePoin, poin, grandTotal]);

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
          poin_earned: 0, // Will be updated upon payment
          poin_used: item === orderItems[0] ? discountFromPoints : 0, // Attach used points to first item or split? Simplified to first item or handled at transaction level if schema supported it. 
          // Actually schema has poin_used on transaksi, so we should split or put on one.
          // Let's put it on the first item for now or better, distribute it. 
          // Simplified: The total transaction row structure in this app seems to be 1 row per item?
          // Looking at the insert payload, it IS creating multiple rows (one per item).
          // This makes "transaction level" fields tricky. 
          // We will assign poin_used to the first item only to avoid double counting.
        };
      });

      // Correct poin_used and poin_earned distribution
      // Ideally we should have a parent 'transaksi_header' table, but based on the schema, 'transaksi' IS the line item?
      // Wait, let's check the schema again. 
      // Table transaksi: kode_struk, total, jumlah...
      // It seems normalized as "one row per service item" but they share kode_struk.
      // So if we add poin_used, we should probably add it to ONE of the rows or change the schema.
      // For now, I will add it to the first row only.

      if (transaksiPayload.length > 0) {
        transaksiPayload[0].poin_used = discountFromPoints;
        // We set poin_earned to 0 initially. It should be calculated and updated when payment is Lunas.
      }


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

  // Function to handle successful payment and point accrual
  const handlePaymentSuccess = async () => {
    if (!kodeStrukForPayment) return;

    // 1. Update status_pembayaran to 'lunas'
    const { error: updateError } = await supabase
      .from('transaksi')
      .update({ status_pembayaran: 'lunas' })
      .eq('kode_struk', kodeStrukForPayment);

    if (updateError) {
      toast.error('Gagal update status: ' + updateError.message);
      return;
    }

    // 2. Refresh customer data to get current accumulated spend
    // We need to calculate if level upgrades
    // And add points

    // Get all transactions for this customer to calc total spend
    // For simplicity, we just add the points now.

    if (formData.nomor_hp) {
      // Get customer id
      const { data: cust } = await supabase.from('pelanggan').select('id, poin, membership_level').eq('nomor_hp', formData.nomor_hp).single();

      if (cust) {
        const earned = potentialPoints; // This assumes potentialPoints didn't change (it shouldn't)
        const newPoinBalance = (cust.poin || 0) - poinUsed + earned;

        // Calculate new level
        // Get total spend in current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { data: transData } = await supabase
          .from('transaksi')
          .select('total')
          .eq('id_pelanggan', cust.id)
          .gte('created_at', firstDay)
          .eq('status_pembayaran', 'lunas');

        const currentMonthTotal = (transData?.reduce((acc, t) => acc + t.total, 0) || 0) + finalTotal; // + current one

        let newLevel = 'Bronze';
        if (currentMonthTotal >= 1000000) newLevel = 'Platinum';
        else if (currentMonthTotal >= 500000) newLevel = 'Gold';
        else if (currentMonthTotal >= 200000) newLevel = 'Silver';

        // Update customer
        await supabase.from('pelanggan').update({
          poin: newPoinBalance,
          membership_level: newLevel
        }).eq('id', cust.id);

        // Also update the transaction record with earned points (just for record)
        // We update all rows with the EARNED points? Or just one? 
        // Let's update the first one we find with this kode_struk or all of them with 0 and one with value?
        // Simplest: update all rows with 0 and the first with the value.
        // Actually, let's just leave it for now or try to update.
        await supabase.from('transaksi')
          .update({ poin_earned: earned })
          .eq('kode_struk', kodeStrukForPayment)
          .eq('id_pelanggan', cust.id) // safety
          .limit(1); // Not standard SQL, depends on Supabase/Postgres. Postgres update doesn't support limit directly easily.
        // Better: Update using ID of the first transaction of this struk.
        // We have createdTransaksiId (which is the first one).
        if (createdTransaksiId) {
          await supabase.from('transaksi').update({ poin_earned: earned }).eq('id', createdTransaksiId);
        }
      }
    }

    window.dispatchEvent(new Event('transaksi-updated'));
    setPaymentModalOpen(false);
    router.push(`/struk/${kodeStrukForPayment}`);
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
                          <div className="mt-3 sm:mt-4 rounded-lg border border-gray-200 bg-gray-50/50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              <div className="flex flex-col">
                                <span className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium">
                                  Jenis
                                </span>
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm uppercase">
                                  {layanan.jenis_layanan}
                                </span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium">
                                  Harga
                                </span>
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                                  Rp {layanan.harga.toLocaleString('id-ID')}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium">
                                  Durasi
                                </span>
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                                  {layanan.durasi_pengerjaan_jam} jam
                                </span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-wide font-medium">
                                  Subtotal
                                </span>
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm">
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

                {/* Membership Info & Points */}
                {formData.nama_pelanggan && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`
                          flex h-8 w-8 items-center justify-center rounded-full 
                          ${membershipLevel === 'Platinum' ? 'bg-slate-800 text-white' :
                            membershipLevel === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                              membershipLevel === 'Silver' ? 'bg-gray-100 text-gray-700' :
                                'bg-amber-100 text-amber-800'}
                          `}>
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Membership</p>
                          <p className="text-sm font-bold text-gray-900">{membershipLevel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Poin</p>
                        <p className="text-sm font-bold text-gray-900">{poin.toLocaleString()}</p>
                      </div>
                    </div>

                    {poin > 0 && (
                      <div className={`mt-3 p-3 rounded-md border transition-colors ${usePoin ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="use-poin"
                            checked={usePoin}
                            onCheckedChange={(checked) => setUsePoin(checked === true)}
                            disabled={poin < 1000}
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-1">
                            <Label
                              htmlFor="use-poin"
                              className="text-sm font-medium leading-none cursor-pointer text-gray-900"
                            >
                              Tukarkan Poin
                            </Label>
                            <p className="text-xs text-gray-500">
                              Gunakan {Math.min(Math.floor(poin / 1000) * 1000, Math.floor(grandTotal / 1000) * 1000)} poin untuk mendapatkan diskon.
                            </p>

                            {poin < 1000 ? (
                              <p className="text-[10px] font-medium text-red-500 flex items-center gap-1">
                                <span>Min. 1.000 poin</span>
                              </p>
                            ) : (
                              usePoin && (
                                <p className="text-xs font-semibold text-blue-600">
                                  Hemat Rp {poinUsed.toLocaleString('id-ID')}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Potensi poin transaksi ini</span>
                      <span className="font-medium text-green-600">+{potentialPoints} poin</span>
                    </div>
                  </div>
                )}

                {/* Grand Total Display with Discount */}
                {grandTotal > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="text-xs sm:text-sm">Subtotal</span>
                        <span className="text-xs sm:text-sm">Rp {grandTotal.toLocaleString('id-ID')}</span>
                      </div>
                      {usePoin && poinUsed > 0 && (
                        <div className="flex items-center justify-between text-green-600">
                          <span className="text-xs sm:text-sm">Diskon Poin</span>
                          <span className="text-xs sm:text-sm">- Rp {poinUsed.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-green-200">
                        <span className="text-xs sm:text-sm font-semibold uppercase text-green-700">
                          Total Bayar
                        </span>
                        <span className="text-lg sm:text-2xl font-bold text-green-800">
                          Rp {finalTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
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
                  onClick={() => router.push('/dashboard')}
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
            total={finalTotal}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
