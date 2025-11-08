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
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Layanan {
  id: string;
  nama: string;
  jenis_layanan: string;
  harga: number;
  durasi_pengerjaan_jam: number;
}

export default function CreateTransaksi() {
  const router = useRouter();
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
      alert('Pilih layanan terlebih dahulu');
      return;
    }

    const jumlah = parseInt(formData.jumlah);
    const total = selectedLayanan.harga * jumlah;
    const kodeStruk = generateKodeStruk();

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + selectedLayanan.durasi_pengerjaan_jam);

    let pelangganId = null;
    const { data: existingPelanggan } = await supabase
      .from('pelanggan')
      .select('id')
      .eq('nomor_hp', formData.nomor_hp)
      .maybeSingle();

    if (existingPelanggan) {
      pelangganId = existingPelanggan.id;
      await supabase
        .from('pelanggan')
        .update({
          nama: formData.nama_pelanggan,
          alamat: formData.alamat,
        })
        .eq('id', pelangganId);
    } else {
      const { data: newPelanggan } = await supabase
        .from('pelanggan')
        .insert([{
          nama: formData.nama_pelanggan,
          nomor_hp: formData.nomor_hp,
          alamat: formData.alamat,
        }])
        .select()
        .single();

      if (newPelanggan) {
        pelangganId = newPelanggan.id;
      }
    }

    const transaksiData = {
      kode_struk: kodeStruk,
      id_pelanggan: pelangganId,
      id_users: null,
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
      alert('Gagal membuat transaksi: ' + error.message);
    } else {
      router.push(`/struk/${kodeStruk}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

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
                          {layanan.nama} - Rp {layanan.harga.toLocaleString('id-ID')} ({layanan.jenis_layanan})
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
                      <Label htmlFor="nama_pelanggan">Nama Pelanggan *</Label>
                      <Input
                        id="nama_pelanggan"
                        value={formData.nama_pelanggan}
                        onChange={(e) => setFormData({ ...formData, nama_pelanggan: e.target.value })}
                        required
                        placeholder="Nama lengkap pelanggan"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nomor_hp">Nomor WhatsApp *</Label>
                      <Input
                        id="nomor_hp"
                        value={formData.nomor_hp}
                        onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                        required
                        placeholder="08123456789"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="alamat">Alamat</Label>
                      <Input
                        id="alamat"
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        placeholder="Alamat lengkap (opsional)"
                        className="mt-2"
                      />
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
    </div>
  );
}
