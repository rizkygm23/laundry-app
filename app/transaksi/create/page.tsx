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
import { CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

interface Layanan {
  id: string;
  nama: string;
  jenis_layanan: string;
  harga: number;
  durasi_pengerjaan_jam: number;
}

export default function CreateTransaksi() {
  const router = useRouter();
  const { user } = useAuth();
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [selectedLayanan, setSelectedLayanan] = useState<Layanan | null>(null);
  const [formData, setFormData] = useState({
    nama_pelanggan: '',
    nomor_hp: '',
    alamat: '',
    jumlah: '1',
  });

  useEffect(() => {
    loadLayanan();
  }, []);

  // Auto-fill pelanggan ketika nomor HP diisi
  useEffect(() => {
    const fetchPelanggan = async () => {
      const nomorHp = formData.nomor_hp.trim();
      
      // Hanya cek jika nomor HP sudah cukup panjang (minimal 10 digit)
      if (nomorHp.length < 10) {
        // Reset form jika nomor HP terlalu pendek
        if (formData.nama_pelanggan || formData.alamat) {
          setFormData(prev => ({
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
          // Pelanggan ditemukan, auto-fill nama dan alamat
          setFormData(prev => {
            // Hanya update jika berbeda untuk menghindari loop
            const shouldUpdate = prev.nama_pelanggan !== data.nama || prev.alamat !== (data.alamat || '');
            if (shouldUpdate) {
              // Hanya show toast jika ini update pertama kali (nama sebelumnya kosong)
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
          // Pelanggan tidak ditemukan, clear nama dan alamat
          setFormData(prev => {
            // Hanya reset jika sebelumnya ada data (untuk menghindari reset saat user sedang mengetik)
            if (prev.nama_pelanggan || prev.alamat) {
              // Hanya clear jika nomor HP benar-benar berbeda (bukan karena sedang diketik)
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

    // Debounce untuk menghindari terlalu banyak request
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

  const handleLayananChange = (layananId: string) => {
    const layanan = layananList.find(l => l.id === layananId);
    setSelectedLayanan(layanan || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLayanan) {
      toast.error('Pilih layanan terlebih dahulu');
      return;
    }

    try {
      const jumlah = parseInt(formData.jumlah);
      const total = selectedLayanan.harga * jumlah;
      const kodeStruk = generateKodeStruk();

      const deadline = new Date();
      deadline.setHours(deadline.getHours() + selectedLayanan.durasi_pengerjaan_jam);

      let pelangganId = null;
      
      // Cek apakah pelanggan sudah ada berdasarkan nomor HP
      const { data: existingPelanggan, error: errorPelangganCek } = await supabase
        .from('pelanggan')
        .select('id, nama, alamat')
        .eq('nomor_hp', formData.nomor_hp.trim())
        .maybeSingle();

      if (errorPelangganCek) {
        console.error('Error checking pelanggan:', errorPelangganCek);
        toast.error('Gagal mengecek data pelanggan: ' + errorPelangganCek.message);
        return;
      }

      if (existingPelanggan) {
        // Pelanggan sudah ada, update data jika ada perubahan
        pelangganId = existingPelanggan.id;
        
        // Update jika nama atau alamat berbeda
        if (existingPelanggan.nama !== formData.nama_pelanggan || 
            (existingPelanggan.alamat || '') !== formData.alamat) {
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
        // Pelanggan belum ada, buat baru
        const { data: newPelanggan, error: errorInsertPelanggan } = await supabase
          .from('pelanggan')
          .insert([{
            nama: formData.nama_pelanggan,
            nomor_hp: formData.nomor_hp.trim(),
            alamat: formData.alamat,
          }])
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

      const transaksiData = {
      kode_struk: kodeStruk,
      id_pelanggan: pelangganId,
      id_users: user?.id || null,
      id_layanan: selectedLayanan.id,
      nama_layanan: selectedLayanan.nama,
      nama_pelanggan: formData.nama_pelanggan,
      alamat_pelanggan: formData.alamat,
      jumlah: jumlah,
      harga_layanan: selectedLayanan.harga,
      total: total,
      status_transaksi: 'antrian',
      status_pembayaran: 'belum_lunas',
      deadline: deadline.toISOString(),
    };

      const { data, error } = await supabase
        .from('transaksi')
        .insert([transaksiData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting transaksi:', error);
        toast.error('Gagal membuat transaksi: ' + error.message);
      } else {
        toast.success('Transaksi berhasil dibuat!');
        router.push(`/struk/${kodeStruk}`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            <CardTitle className="text-2xl">Buat Transaksi Baru</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="layanan" className="text-base font-semibold">Pilih Layanan *</Label>
                  <Select onValueChange={handleLayananChange} required>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Pilih layanan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {layananList.map((layanan) => (
                        <SelectItem key={layanan.id} value={layanan.id}>
                          {layanan.nama} - Rp {layanan.harga.toLocaleString('id-ID')} ({layanan.jenis_layanan}) • {layanan.durasi_pengerjaan_jam} jam
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLayanan && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Jenis:</span>
                        <span className="ml-2 font-semibold">{selectedLayanan.jenis_layanan.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Harga:</span>
                        <span className="ml-2 font-semibold">Rp {selectedLayanan.harga.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Durasi:</span>
                        <span className="ml-2 font-semibold">{selectedLayanan.durasi_pengerjaan_jam} jam</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="jumlah" className="text-base font-semibold">
                    Jumlah ({selectedLayanan?.jenis_layanan === 'kiloan' ? 'Kg' : 'Pcs'}) *
                  </Label>
                  <Input
                    id="jumlah"
                    type="number"
                    min="1"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>

                {selectedLayanan && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-lg font-bold text-green-800">
                      Total: Rp {(selectedLayanan.harga * parseInt(formData.jumlah || '1')).toLocaleString('id-ID')}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Data Pelanggan</h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nomor_hp">Nomor WhatsApp *</Label>
                      <div className="relative mt-2">
                        <Input
                          id="nomor_hp"
                          type="tel"
                          value={formData.nomor_hp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Hanya angka
                            setFormData({ ...formData, nomor_hp: value });
                          }}
                          required
                          placeholder="08123456789"
                          className="pr-10"
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
                      {formData.nama_pelanggan && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Pelanggan ditemukan: {formData.nama_pelanggan}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="nama_pelanggan">Nama Pelanggan *</Label>
                      <Input
                        id="nama_pelanggan"
                        value={formData.nama_pelanggan}
                        onChange={(e) => setFormData({ ...formData, nama_pelanggan: e.target.value })}
                        required
                        placeholder="Nama akan terisi otomatis jika pelanggan sudah terdaftar"
                        className="mt-2"
                      />
                      {formData.nama_pelanggan && formData.nomor_hp.length >= 10 && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Nama diisi otomatis dari database. Anda bisa mengedit jika perlu.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="alamat">Alamat</Label>
                      <Input
                        id="alamat"
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        placeholder="Alamat akan terisi otomatis jika pelanggan sudah terdaftar"
                        className="mt-2"
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

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
                >
                  Buat Transaksi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="h-12"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
