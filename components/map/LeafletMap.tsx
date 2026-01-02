'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Next.js/Webpack
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

interface LeafletMapProps {
    center: [number, number];
    zoom?: number;
    onLocationSelect?: (lat: number, lng: number) => void;
    selectedLocation?: [number, number] | null;
    outletLocation?: [number, number] | null;
}

function LocationMarker({ onLocationSelect, selectedLocation }: { onLocationSelect?: (lat: number, lng: number) => void, selectedLocation?: [number, number] | null }) {
    const map = useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
                map.flyTo(e.latlng, map.getZoom());
            }
        },
    });

    useEffect(() => {
        if (selectedLocation) {
            map.flyTo(selectedLocation, map.getZoom());
        }
    }, [selectedLocation, map]);

    return selectedLocation ? (
        <Marker position={selectedLocation}>
            <Popup>Lokasi Penjemputan Anda</Popup>
        </Marker>
    ) : null;

}

function LocateControl({ onLocationFound }: { onLocationFound?: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        locationfound(e) {
            if (onLocationFound) {
                onLocationFound(e.latlng.lat, e.latlng.lng);
                map.flyTo(e.latlng, map.getZoom());
            }
        },
    });

    useEffect(() => {
        map.locate({ setView: true, maxZoom: 16 });
    }, [map]);

    return null;
}

export default function LeafletMap({ center, zoom = 13, onLocationSelect, selectedLocation, outletLocation }: LeafletMapProps) {
    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {/* User Selected Location */}
            <LocationMarker onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
            <LocateControl onLocationFound={onLocationSelect} />

            {/* Outlet Location Indicator */}
            {outletLocation && (
                <Marker position={outletLocation} icon={new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })}>
                    <Popup>
                        <b>Outlet Laundry</b><br />Lokasi Kami
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
