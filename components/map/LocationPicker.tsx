'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100"><Loader2 className="animate-spin text-blue-600" /></div>,
    ssr: false
});

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    selectedLocation: { lat: number, lng: number } | null;
    outletLocation: { lat: number, lng: number } | null;
}

export default function LocationPicker({ onLocationSelect, selectedLocation, outletLocation }: LocationPickerProps) {
    const defaultCenter: [number, number] = outletLocation
        ? [outletLocation.lat, outletLocation.lng]
        : [-6.200000, 106.816666]; // Jakarta default

    const selectedLatLng: [number, number] | null = useMemo(() =>
        selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null,
        [selectedLocation]);

    const outletLatLng: [number, number] | null = useMemo(() =>
        outletLocation ? [outletLocation.lat, outletLocation.lng] : null,
        [outletLocation]);

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300 relative z-0">
            <LeafletMap
                center={selectedLatLng || defaultCenter}
                zoom={13}
                onLocationSelect={onLocationSelect}
                selectedLocation={selectedLatLng}
                outletLocation={outletLatLng}
            />
        </div>
    );
}
