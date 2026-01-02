'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// import { Navigation } from 'lucide-react'; // Can't import Lucide inside Leaflet Map usually, use standard DOM or L.divIcon if needed

// Fix Leaflet icons
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Driver Icon (Truck or Blue Dot)
const driverIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/7541/7541900.png', // Example Truck Icon or similar
    // Fallback to a blue marker if that fails, or use a standard colored marker
    // Let's use a trusted CDN for a different colored marker
    // iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/2x-blue.png', 
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [40, 40], // Truck icon might be square
    iconAnchor: [20, 20],
    popupAnchor: [1, -20],
    shadowSize: [41, 41]
});

const targetIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface DeliveryMapProps {
    targetLocation: [number, number];
    targetAddress?: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    // useEffect(() => {
    //     map.flyTo(center, 15);
    // }, [center, map]);
    return null;
}

export default function DeliveryMap({ targetLocation, targetAddress }: DeliveryMapProps) {
    const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        if ('geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setDriverLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error watching position:", error);
                },
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Calculate bounds to show both markers
    const bounds = driverLocation ? L.latLngBounds([driverLocation, targetLocation]) : L.latLngBounds([targetLocation]);

    return (
        <MapContainer
            center={driverLocation || targetLocation}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
        // bounds={bounds} // Does not work directly as prop in v3/v4 sometimes, better use Component
        >
            <TileLayer
                attribution='&copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {/* Logic to fit bounds */}
            <BoundsFitter bounds={bounds} />

            {/* Driver Marker */}
            {driverLocation && (
                <Marker position={driverLocation} icon={driverIcon}>
                    <Popup>Lokasi Anda (Driver)</Popup>
                </Marker>
            )}

            {/* Target Marker */}
            <Marker position={targetLocation} icon={targetIcon}>
                <Popup>
                    <b>Tujuan</b><br />
                    {targetAddress || 'Lokasi Pelanggan'}
                </Popup>
            </Marker>
        </MapContainer>
    );
}

function BoundsFitter({ bounds }: { bounds: L.LatLngBounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
}
