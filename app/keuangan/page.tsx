'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Pengeluaran {
  id: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
  tanggal: string;
  created_at: string;
}

type Timeframe = 'hari_ini' | 'seminggu' | 'sebulan' | 'tahun';

export default function KeuanganPage() {
  const [transaksiHarian, setTransaksiHarian] = useState<any[]>([]);
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([]);
  const [allTransaksi, setAllTransaksi] = useState<any[]>([]);
  const [allPengeluaran, setAllPengeluaran] = useState<Pengeluaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('hari_ini');
  const [editingPengeluaran, setEditingPengeluaran] = useState<Pengeluaran | null>(null);
  const [formData, setFormData] = useState({
    kategori: '',
    deskripsi: '',
    jumlah: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  // Stats
  const [stats, setStats] = useState({
    totalPendapatan: 0,
    totalPengeluaran: 0,
    saldoKas: 0,
    transaksiHariIni: 0,
    pengeluaranHariIni: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterDataByTimeframe();
  }, [timeframe, allTransaksi, allPengeluaran]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transaksiResult, pengeluaranResult] = await Promise.all([
        supabase
          .from('transaksi')
          .select('*')
          .eq('status_pembayaran', 'lunas')
          .order('created_at', { ascending: false }),
        supabase
          .from('pengeluaran')
          .select('*')
          .order('tanggal', { ascending: false }),
      ]);

      if (transaksiResult.error) {
        console.error('Error loading transaksi:', transaksiResult.error);
      } else if (transaksiResult.data) {
        setAllTransaksi(transaksiResult.data);
      }

      if (pengeluaranResult.error) {
        console.error('Error loading pengeluaran:', pengeluaranResult.error);
      } else if (pengeluaranResult.data) {
        setAllPengeluaran(pengeluaranResult.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (tf: Timeframe) => {
    const now = new Date();
    let start: Date, end: Date;

    switch (tf) {
      case 'hari_ini':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'seminggu':
        start = startOfWeek(now, { locale: idLocale });
        end = endOfWeek(now, { locale: idLocale });
        break;
      case 'sebulan':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'tahun':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = startOfDay(now);
        end = endOfDay(now);
    }

    return { start, end };
  };

  const filterDataByTimeframe = () => {
    const { start, end } = getDateRange(timeframe);

    // Filter transaksi
    const filteredTransaksi = allTransaksi.filter((t) => {
      const tDate = new Date(t.created_at);
      return tDate >= start && tDate <= end;
    });

    // Filter pengeluaran
    const filteredPengeluaran = allPengeluaran.filter((p) => {
      const pDate = new Date(p.tanggal);
      return pDate >= start && pDate <= end;
    });

    setTransaksiHarian(filteredTransaksi);
    setPengeluaranList(filteredPengeluaran);
    calculateStats(filteredTransaksi, filteredPengeluaran);
  };

  const calculateStats = (transaksi: any[] = transaksiHarian, pengeluaran: Pengeluaran[] = pengeluaranList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total pendapatan (semua transaksi lunas)
    const totalPendapatan = transaksi.reduce((sum, t) => sum + t.total, 0);

    // Total pengeluaran
    const totalPengeluaran = pengeluaran.reduce((sum, p) => sum + p.jumlah, 0);

    // Saldo kas
    const saldoKas = totalPendapatan - totalPengeluaran;

    // Transaksi dalam periode (untuk card "Hari Ini/Minggu Ini/Bulan Ini/Tahun Ini")
    const transaksiHariIni = transaksi.reduce((sum, t) => sum + t.total, 0);

    // Pengeluaran dalam periode
    const pengeluaranHariIni = pengeluaran.reduce((sum, p) => sum + p.jumlah, 0);

    setStats({
      totalPendapatan,
      totalPengeluaran,
      saldoKas,
      transaksiHariIni,
      pengeluaranHariIni,
    });
  };

  // Group by month for yearly recap
  const getYearlyRecap = () => {
    const currentYear = format(new Date(), 'yyyy', { locale: idLocale });
    const monthlyData: Record<string, { pendapatan: number; pengeluaran: number }> = {};

    // Filter transaksi for current year
    allTransaksi
      .filter((t) => {
        const tYear = format(new Date(t.created_at), 'yyyy', { locale: idLocale });
        return tYear === currentYear;
      })
      .forEach((t) => {
        const monthKey = format(new Date(t.created_at), 'yyyy-MM', { locale: idLocale });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { pendapatan: 0, pengeluaran: 0 };
        }
        monthlyData[monthKey].pendapatan += t.total;
      });

    // Filter pengeluaran for current year
    allPengeluaran
      .filter((p) => {
        const pYear = format(new Date(p.tanggal), 'yyyy', { locale: idLocale });
        return pYear === currentYear;
      })
      .forEach((p) => {
        const monthKey = format(new Date(p.tanggal), 'yyyy-MM', { locale: idLocale });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { pendapatan: 0, pengeluaran: 0 };
        }
        monthlyData[monthKey].pengeluaran += p.jumlah;
      });

    return Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        monthName: format(new Date(month + '-01'), 'MMMM yyyy', { locale: idLocale }),
        ...data,
        saldo: data.pendapatan - data.pengeluaran,
      }));
  };

  const handleOpenDialog = (pengeluaran?: Pengeluaran) => {
    if (pengeluaran) {
      setEditingPengeluaran(pengeluaran);
      setFormData({
        kategori: pengeluaran.kategori,
        deskripsi: pengeluaran.deskripsi,
        jumlah: pengeluaran.jumlah.toString(),
        tanggal: new Date(pengeluaran.tanggal).toISOString().split('T')[0],
      });
    } else {
      setEditingPengeluaran(null);
      setFormData({
        kategori: '',
        deskripsi: '',
        jumlah: '',
        tanggal: new Date().toISOString().split('T')[0],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPengeluaran(null);
    setFormData({
      kategori: '',
      deskripsi: '',
      jumlah: '',
      tanggal: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmitPengeluaran = async () => {
    if (!formData.kategori || !formData.deskripsi || !formData.jumlah) {
      toast.error('Harap lengkapi semua field');
      return;
    }

    try {
      const jumlah = parseInt(formData.jumlah, 10);
      if (isNaN(jumlah) || jumlah <= 0) {
        toast.error('Jumlah harus berupa angka positif');
        return;
      }

      if (editingPengeluaran) {
        const { error } = await supabase
          .from('pengeluaran')
          .update({
            kategori: formData.kategori,
            deskripsi: formData.deskripsi,
            jumlah,
            tanggal: new Date(formData.tanggal).toISOString(),
          })
          .eq('id', editingPengeluaran.id);

        if (error) throw error;
        toast.success('Pengeluaran berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('pengeluaran')
          .insert([
            {
              kategori: formData.kategori,
              deskripsi: formData.deskripsi,
              jumlah,
              tanggal: new Date(formData.tanggal).toISOString(),
            },
          ]);

        if (error) throw error;
        toast.success('Pengeluaran berhasil ditambahkan');
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Error saving pengeluaran:', error);
      toast.error('Gagal menyimpan pengeluaran: ' + error.message);
    }
  };

  const handleDeletePengeluaran = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) return;

    try {
      const { error } = await supabase.from('pengeluaran').delete().eq('id', id);

      if (error) throw error;
      toast.success('Pengeluaran berhasil dihapus');
      loadData();
    } catch (error: any) {
      console.error('Error deleting pengeluaran:', error);
      toast.error('Gagal menghapus pengeluaran: ' + error.message);
    }
  };

  // Group transaksi by date (from filtered transaksiHarian)
  const transaksiByDate = transaksiHarian.reduce((acc, t) => {
    const date = format(new Date(t.created_at), 'yyyy-MM-dd', { locale: idLocale });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(t);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Memuat data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Keuangan</h1>
            <p className="text-gray-600 mt-1">Pantau keuangan usaha laundry Anda</p>
          </div>
          
          {/* Timeframe Tabs */}
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as Timeframe)}>
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="hari_ini" className="text-xs sm:text-sm">Hari Ini</TabsTrigger>
              <TabsTrigger value="seminggu" className="text-xs sm:text-sm">Seminggu</TabsTrigger>
              <TabsTrigger value="sebulan" className="text-xs sm:text-sm">Sebulan</TabsTrigger>
              <TabsTrigger value="tahun" className="text-xs sm:text-sm">Tahun</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats Cards - Compact for mobile */}
        <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-green-600">
              Rp {stats.totalPendapatan.toLocaleString('id-ID')}
            </p>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Pengeluaran</CardTitle>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-red-600">
              Rp {stats.totalPengeluaran.toLocaleString('id-ID')}
            </p>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Saldo Kas</CardTitle>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">
              Rp {stats.saldoKas.toLocaleString('id-ID')}
            </p>
          </Card>

          <Card className="p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
              {timeframe === 'hari_ini' ? 'Hari Ini' : timeframe === 'seminggu' ? 'Minggu Ini' : timeframe === 'sebulan' ? 'Bulan Ini' : 'Tahun Ini'}
            </CardTitle>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-gray-600">
                Pendapatan: <span className="font-semibold text-green-600">Rp {stats.transaksiHariIni.toLocaleString('id-ID')}</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Pengeluaran: <span className="font-semibold text-red-600">Rp {stats.pengeluaranHariIni.toLocaleString('id-ID')}</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Yearly Recap View */}
        {timeframe === 'tahun' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rekap Tahunan {format(new Date(), 'yyyy', { locale: idLocale })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Bulan</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Pendapatan</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Pengeluaran</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getYearlyRecap().map((data) => (
                        <TableRow key={data.month}>
                          <TableCell className="font-semibold text-xs sm:text-sm">{data.monthName}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600 text-xs sm:text-sm">
                            Rp {data.pendapatan.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600 text-xs sm:text-sm">
                            Rp {data.pengeluaran.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className={`text-right font-bold text-xs sm:text-sm ${data.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            Rp {data.saldo.toLocaleString('id-ID')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Pengeluaran untuk tahun */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base sm:text-lg">Pengeluaran</CardTitle>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Tambah</span>
                </Button>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {pengeluaranList.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-sm">Belum ada pengeluaran</p>
                ) : (
                  <div className="rounded-md border max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px] sm:text-xs p-2">Tanggal</TableHead>
                          <TableHead className="text-[10px] sm:text-xs p-2">Kategori</TableHead>
                          <TableHead className="text-[10px] sm:text-xs p-2 hidden sm:table-cell">Deskripsi</TableHead>
                          <TableHead className="text-right text-[10px] sm:text-xs p-2">Jumlah</TableHead>
                          <TableHead className="text-right text-[10px] sm:text-xs p-2">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pengeluaranList.slice(0, 10).map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-[10px] sm:text-xs p-2">
                              {format(new Date(p.tanggal), 'dd MMM yyyy', { locale: idLocale })}
                            </TableCell>
                            <TableCell className="p-2">
                              <Badge variant="outline" className="text-[10px] sm:text-xs">{p.kategori}</Badge>
                            </TableCell>
                            <TableCell className="text-[10px] sm:text-xs p-2 hidden sm:table-cell truncate max-w-[150px]">{p.deskripsi}</TableCell>
                            <TableCell className="text-right font-semibold text-red-600 text-[10px] sm:text-xs p-2">
                              Rp {p.jumlah.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-right p-2">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDialog(p)}
                                  className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePengeluaran(p.id)}
                                  className="text-red-600 hover:text-red-700 h-6 w-6 sm:h-7 sm:w-7 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Transaksi Harian dan Pengeluaran - Side by Side */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* Transaksi Harian */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Transaksi Harian</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                  {Object.keys(transaksiByDate).length === 0 ? (
                    <p className="text-center text-gray-500 py-4 text-sm">Belum ada transaksi</p>
                  ) : (
                    Object.entries(transaksiByDate)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .slice(0, 10) // Limit to 10 most recent for mobile
                      .map(([date, transactions]) => {
                        const total = transactions.reduce((sum, t) => sum + t.total, 0);
                        return (
                          <div key={date} className="flex justify-between items-center p-2 sm:p-3 border rounded-lg hover:bg-gray-50">
                            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate flex-1 mr-2">
                              {format(new Date(date), 'EEEE, dd MMM yyyy', { locale: idLocale })}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap">
                              Rp {total.toLocaleString('id-ID')}
                            </Badge>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>

          {/* Pengeluaran */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base sm:text-lg">Pengeluaran</CardTitle>
              <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700" size="sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Tambah</span>
              </Button>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {pengeluaranList.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">Belum ada pengeluaran</p>
              ) : (
                <div className="rounded-md border max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] sm:text-xs p-2">Tanggal</TableHead>
                        <TableHead className="text-[10px] sm:text-xs p-2">Kategori</TableHead>
                        <TableHead className="text-[10px] sm:text-xs p-2 hidden sm:table-cell">Deskripsi</TableHead>
                        <TableHead className="text-right text-[10px] sm:text-xs p-2">Jumlah</TableHead>
                        <TableHead className="text-right text-[10px] sm:text-xs p-2">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pengeluaranList.slice(0, 10).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-[10px] sm:text-xs p-2">
                            {format(new Date(p.tanggal), 'dd MMM yyyy', { locale: idLocale })}
                          </TableCell>
                          <TableCell className="p-2">
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{p.kategori}</Badge>
                          </TableCell>
                          <TableCell className="text-[10px] sm:text-xs p-2 hidden sm:table-cell truncate max-w-[150px]">{p.deskripsi}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600 text-[10px] sm:text-xs p-2">
                            Rp {p.jumlah.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-right p-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(p)}
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePengeluaran(p.id)}
                                className="text-red-600 hover:text-red-700 h-6 w-6 sm:h-7 sm:w-7 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Dialog Tambah/Edit Pengeluaran */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPengeluaran ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Kategori *</Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operasional">Operasional</SelectItem>
                    <SelectItem value="Bahan Baku">Bahan Baku</SelectItem>
                    <SelectItem value="Gaji">Gaji</SelectItem>
                    <SelectItem value="Sewa">Sewa</SelectItem>
                    <SelectItem value="Listrik">Listrik</SelectItem>
                    <SelectItem value="Air">Air</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deskripsi *</Label>
                <Input
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Masukkan deskripsi pengeluaran"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Jumlah (Rp) *</Label>
                <Input
                  type="number"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Tanggal *</Label>
                <Input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Batal
                </Button>
                <Button onClick={handleSubmitPengeluaran} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingPengeluaran ? 'Simpan' : 'Tambah'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

