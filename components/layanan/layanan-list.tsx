'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Layanan {
  id: string;
  nama: string;
  jenis_layanan: string;
  harga: number;
  durasi_pengerjaan_jam: number;
}

export default function LayananList() {
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    jenis_layanan: 'kiloan',
    harga: '',
    durasi_pengerjaan_jam: '24',
  });

  useEffect(() => {
    loadLayanan();
  }, []);

  const loadLayanan = async () => {
    const { data } = await supabase
      .from('layanan_laundry')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setLayananList(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const layananData = {
        nama: formData.nama,
        jenis_layanan: formData.jenis_layanan,
        harga: parseInt(formData.harga),
        durasi_pengerjaan_jam: parseInt(formData.durasi_pengerjaan_jam),
      };

      let error;
      if (editingId) {
        const result = await supabase.from('layanan_laundry').update(layananData).eq('id', editingId);
        error = result.error;
      } else {
        const result = await supabase.from('layanan_laundry').insert([layananData]);
        error = result.error;
      }

      if (error) {
        console.error('Error saving layanan:', error);
        alert('Gagal menyimpan layanan: ' + error.message);
        return;
      }

      setIsOpen(false);
      resetForm();
      loadLayanan();
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleEdit = (layanan: Layanan) => {
    setEditingId(layanan.id);
    setFormData({
      nama: layanan.nama,
      jenis_layanan: layanan.jenis_layanan,
      harga: layanan.harga.toString(),
      durasi_pengerjaan_jam: layanan.durasi_pengerjaan_jam.toString(),
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      try {
        const { error } = await supabase.from('layanan_laundry').delete().eq('id', id);
        if (error) {
          console.error('Error deleting layanan:', error);
          alert('Gagal menghapus layanan: ' + error.message);
          return;
        }
        loadLayanan();
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      jenis_layanan: 'kiloan',
      harga: '',
      durasi_pengerjaan_jam: '24',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Daftar Layanan</h2>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Layanan
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Layanan</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                  placeholder="Contoh: Cuci Kering Setrika"
                />
              </div>
              <div>
                <Label htmlFor="jenis">Jenis Layanan</Label>
                <Select
                  value={formData.jenis_layanan}
                  onValueChange={(value) => setFormData({ ...formData, jenis_layanan: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kiloan">Kiloan</SelectItem>
                    <SelectItem value="satuan">Satuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="harga">Harga (Rp)</Label>
                <Input
                  id="harga"
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  required
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="durasi">Durasi Pengerjaan (Jam)</Label>
                <Input
                  id="durasi"
                  type="number"
                  value={formData.durasi_pengerjaan_jam}
                  onChange={(e) => setFormData({ ...formData, durasi_pengerjaan_jam: e.target.value })}
                  required
                  placeholder="24"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Update' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-xs sm:text-sm">Nama Layanan</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">Jenis</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">Harga</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm hidden sm:table-cell">Durasi</TableHead>
              <TableHead className="font-semibold text-right text-xs sm:text-sm">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {layananList.map((layanan) => (
              <TableRow key={layanan.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-xs sm:text-sm">{layanan.nama}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] sm:text-xs ${layanan.jenis_layanan === 'kiloan' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {layanan.jenis_layanan.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-xs sm:text-sm">Rp {layanan.harga.toLocaleString('id-ID')}</TableCell>
                <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{layanan.durasi_pengerjaan_jam} jam</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(layanan)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(layanan.id)}
                      className="text-red-600 hover:text-red-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
