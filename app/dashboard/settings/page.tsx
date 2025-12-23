'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import LocationPicker from '@/components/map/LocationPicker';
import { Save, MapPin, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [outletLocation, setOutletLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [address, setAddress] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('outlet_settings')
                .select('*')
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setOutletLocation({ lat: data.latitude, lng: data.longitude });
                setAddress(data.address || '');
            } else {
                // Default if no settings found
                setOutletLocation({ lat: -6.175392, lng: 106.827153 }); // Monas
            }
        } catch (err) {
            console.error('Error loading settings:', err);
            toast.error('Gagal memuat pengaturan outlet');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!outletLocation) return;
        setSaving(true);
        try {
            // Check if exists
            const { data: existing } = await supabase.from('outlet_settings').select('id').maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from('outlet_settings')
                    .update({
                        latitude: outletLocation.lat,
                        longitude: outletLocation.lng,
                        address: address,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('outlet_settings')
                    .insert([{
                        latitude: outletLocation.lat,
                        longitude: outletLocation.lng,
                        address: address
                    }]);
                if (error) throw error;
            }
            toast.success('Lokasi outlet berhasil disimpan');
        } catch (err) {
            console.error('Error saving settings:', err);
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Lokasi Outlet Laundry</CardTitle>
                    <CardDescription>
                        Tentukan lokasi outlet Anda untuk perhitungan jarak dan ongkos kirim otomatis.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Pilih Lokasi di Peta</Label>
                        <LocationPicker
                            selectedLocation={outletLocation}
                            outletLocation={outletLocation} // Show itself as outlet
                            onLocationSelect={(lat, lng) => setOutletLocation({ lat, lng })}
                        />
                        <p className="text-sm text-gray-500">Klik pada peta untuk menggeser lokasi outlet.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Latitude</Label>
                            <Input value={outletLocation?.lat || ''} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label>Longitude</Label>
                            <Input value={outletLocation?.lng || ''} readOnly />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat Lengkap Outlet</Label>
                        <Input
                            id="address"
                            placeholder="Contoh: Jl. Merdeka No. 45, Jakarta Pusat"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan Pengaturan
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
