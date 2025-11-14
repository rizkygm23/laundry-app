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
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Pelanggan {
  id: string;
  nama: string;
  nomor_hp: string;
  alamat: string;
}

export default function PelangganList() {
  const [pelangganList, setPelangganList] = useState<Pelanggan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nomor_hp: '',
    alamat: '',
  });

  useEffect(() => {
    loadPelanggan();
  }, []);

  const loadPelanggan = async () => {
    const { data } = await supabase
      .from('pelanggan')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPelangganList(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let error;
      if (editingId) {
        const result = await supabase.from('pelanggan').update(formData).eq('id', editingId);
        error = result.error;
      } else {
        const result = await supabase.from('pelanggan').insert([formData]);
        error = result.error;
      }

      if (error) {
        console.error('Error saving pelanggan:', error);
        alert('Gagal menyimpan pelanggan: ' + error.message);
        return;
      }

      setIsOpen(false);
      resetForm();
      loadPelanggan();
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Terjadi kesalahan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleEdit = (pelanggan: Pelanggan) => {
    setEditingId(pelanggan.id);
    setFormData({
      nama: pelanggan.nama,
      nomor_hp: pelanggan.nomor_hp,
      alamat: pelanggan.alamat,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
      try {
        const { error } = await supabase.from('pelanggan').delete().eq('id', id);
        if (error) {
          console.error('Error deleting pelanggan:', error);
          alert('Gagal menghapus pelanggan: ' + error.message);
          return;
        }
        loadPelanggan();
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
      nomor_hp: '',
      alamat: '',
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Daftar Pelanggan</h2>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pelanggan
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingId ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                  placeholder="Nama pelanggan"
                />
              </div>
              <div>
                <Label htmlFor="nomor_hp">Nomor WhatsApp</Label>
                <Input
                  id="nomor_hp"
                  value={formData.nomor_hp}
                  onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                  required
                  placeholder="08123456789"
                />
              </div>
              <div>
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat lengkap (opsional)"
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
              <TableHead className="font-semibold text-xs sm:text-sm">Nama</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm">Nomor WhatsApp</TableHead>
              <TableHead className="font-semibold text-xs sm:text-sm hidden sm:table-cell">Alamat</TableHead>
              <TableHead className="font-semibold text-right text-xs sm:text-sm">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pelangganList.map((pelanggan) => (
              <TableRow key={pelanggan.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-xs sm:text-sm">{pelanggan.nama}</TableCell>
                <TableCell className="text-xs sm:text-sm">{pelanggan.nomor_hp}</TableCell>
                <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{pelanggan.alamat || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(pelanggan)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    >
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pelanggan.id)}
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
