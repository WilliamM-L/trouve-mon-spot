import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import ParkingMarker from './ParkingMarker';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// User location marker icon
const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#f72585" stroke="#fff" stroke-width="3"/>
      <circle cx="12" cy="12" r="4" fill="#fff"/>
    </svg>
  `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Component to recenter map when location changes
function MapUpdater({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], map.getZoom());
        }
    }, [center, map]);

    return null;
}

export default function Map({ center, radius, parkingData }) {
    if (!center) {
        return (
            <div className="map-loading">
                <div className="loading-spinner"></div>
                <p>Getting your location...</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={16}
            className="map-container"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater center={center} />

            {/* User location marker */}
            <Marker position={[center.lat, center.lng]} icon={userIcon}>
                <Popup>
                    <strong>📍 Your Location</strong>
                </Popup>
            </Marker>

            {/* Search radius circle */}
            <Circle
                center={[center.lat, center.lng]}
                radius={radius}
                pathOptions={{
                    color: '#4361ee',
                    fillColor: '#4361ee',
                    fillOpacity: 0.1,
                    weight: 2
                }}
            />

            {/* Parking markers */}
            {parkingData.map((feature, index) => (
                <ParkingMarker key={feature.properties.POTEAU_ID_POT || index} feature={feature} />
            ))}
        </MapContainer>
    );
}
