'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Truck, MapPin, Navigation, Phone, CheckCircle, Package } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// Dynamic import for Map to avoid SSR issues
const DeliveryMap = dynamic(() => import('@/components/map/DeliveryMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Memuat Peta...</div>
});

interface TransaksiDelivery {
    id: string;
    kode_struk: string;
    nama_pelanggan: string;
    nomor_hp: string; // Need to fetch from pelanggan table joined? or added to transaksi?
    // Transaksi table has nama_pelanggan, alamat_pelanggan. 
    // nomor_hp is usually on pelanggan table.
    alamat_pelanggan: string;
    latitude: number;
    longitude: number;
    status_transaksi: string;
    jarak_km: number;
    ongkos_kirim: number;
    total: number;
    id_pelanggan: string;
}

export default function DeliveryPage() {
    const [activeTab, setActiveTab] = useState('penjemputan');
    const [tasks, setTasks] = useState<TransaksiDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<TransaksiDelivery | null>(null);
    const [customerPhone, setCustomerPhone] = useState<string | null>(null);

    useEffect(() => {
        fetchTasks();
    }, [activeTab]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            // Filter based on tab
            const status = activeTab === 'penjemputan' ? 'penjemputan' : 'selesai';

            let query = supabase
                .from('transaksi_laundry')
                .select('*')
                .eq('status_transaksi', status)
                .order('created_at', { ascending: true });

            // Jika tab pengantaran, hanya tampilkan yang punya lokasi (online order/delivery)
            if (activeTab === 'antar') {
                query = query.not('latitude', 'is', null);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            toast.error('Gagal memuat tugas');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = async (task: TransaksiDelivery) => {
        setSelectedTask(task);
        // Fetch phone number from pelanggan table
        if (task.id_pelanggan) {
            const { data } = await supabase.from('pelanggan_laundry').select('nomor_hp').eq('id', task.id_pelanggan).single();
            if (data) setCustomerPhone(data.nomor_hp);
            else setCustomerPhone(null);
        } else {
            // Try to get from transaksi if stored (it's not usually stored, only name)
            // Maybe fallback to searching by name if id_pelanggan is null (legacy data)
            setCustomerPhone(null);
        }
    };

    const handleCloseDetail = () => {
        setSelectedTask(null);
        setCustomerPhone(null);
    };

    const openGoogleMaps = () => {
        if (!selectedTask) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedTask.latitude},${selectedTask.longitude}`;
        window.open(url, '_blank');
    };

    const updateStatus = async (newStatus: string) => {
        if (!selectedTask) return;
        try {
            const { error } = await supabase
                .from('transaksi_laundry')
                .update({ status_transaksi: newStatus })
                .eq('id', selectedTask.id);

            if (error) throw error;

            toast.success(`Status berhasil diperbarui menjadi ${newStatus.toUpperCase()}`);
            handleCloseDetail();
            fetchTasks(); // Refresh list
        } catch (err) {
            console.error('Error update status:', err);
            toast.error('Gagal update status');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="h-6 w-6 text-blue-600" />
                        Pesanan Online (Antar Jemput)
                    </h1>
                    <p className="text-gray-600 mt-1">Kelola penjemputan dan pengantaran laundry.</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="penjemputan">Penjemputan</TabsTrigger>
                        <TabsTrigger value="antar">Pengantaran</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        {loading ? (
                            <div className="text-center py-12">Memuat data...</div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg bg-gray-50 border-dashed">
                                <Package className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500">Tidak ada tugas {activeTab === 'penjemputan' ? 'penjemputan' : 'pengantaran'} saat ini.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tasks.map((task) => (
                                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500" onClick={() => handleOpenDetail(task)}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge>{task.kode_struk}</Badge>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {task.jarak_km ? `${task.jarak_km} km` : 'Jarak -'}
                                                </Badge>
                                            </div>
                                            <h3 className="font-semibold text-lg line-clamp-1">{task.nama_pelanggan}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1 min-h-[40px]">
                                                {task.alamat_pelanggan || 'Alamat tidak tersedia'}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between text-sm">
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {activeTab === 'penjemputan' ? 'Lokasi Jemput' : 'Lokasi Antar'}
                                                </span>
                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 p-0 h-auto">
                                                    Lihat Detail
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </Tabs>

                {/* Detail Modal */}
                <Dialog open={!!selectedTask} onOpenChange={(open) => !open && handleCloseDetail()}>
                    <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                        <DialogHeader className="p-4 sm:p-6 pb-2 border-b bg-white z-10">
                            <DialogTitle className="flex items-center justify-between">
                                <span>Detail {activeTab === 'penjemputan' ? 'Penjemputan' : 'Pengantaran'}</span>
                                <Badge variant="outline" className="ml-2 font-mono">{selectedTask?.kode_struk}</Badge>
                            </DialogTitle>
                            <DialogDescription>
                                {selectedTask?.nama_pelanggan}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 relative bg-gray-100 min-h-[300px]">
                            {/* Map Section */}
                            {selectedTask && selectedTask.latitude && selectedTask.longitude ? (
                                <DeliveryMap
                                    targetLocation={[selectedTask.latitude, selectedTask.longitude]}
                                    targetAddress={selectedTask.alamat_pelanggan}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
                                    <MapPin className="h-8 w-8 text-gray-300" />
                                    <p>Data lokasi (koordinat) tidak tersedia untuk pesanan ini.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 bg-white border-t z-10 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">Alamat Tujuan</p>
                                        <p className="text-sm text-gray-600">{selectedTask?.alamat_pelanggan}</p>
                                    </div>
                                </div>
                                {customerPhone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-gray-500" />
                                        <div className="flex gap-2 items-center">
                                            <p className="text-sm text-gray-600">{customerPhone}</p>
                                            <a href={`https://wa.me/${customerPhone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-xs text-green-600 font-semibold hover:underline">
                                                Chat WA
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button onClick={openGoogleMaps} variant="outline" className="w-full border-blue-600 text-blue-600">
                                    <Navigation className="mr-2 h-4 w-4" />
                                    Buka Gmaps
                                </Button>
                                {activeTab === 'penjemputan' ? (
                                    <Button onClick={() => updateStatus('antrian')} className="w-full bg-blue-600 hover:bg-blue-700">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Selesai Jemput
                                    </Button>
                                ) : (
                                    <Button onClick={() => updateStatus('terkirim')} className="w-full bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Selesai Antar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
