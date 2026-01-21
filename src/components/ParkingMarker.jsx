import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Default parking sign marker icon (blue P)
const parkingIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <circle cx="12" cy="12" r="11" fill="#4361ee" stroke="#fff" stroke-width="2"/>
      <text x="12" y="17" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">P</text>
    </svg>
  `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
});

// Motorcycle parking icon (orange with motorcycle silhouette)
const motorcycleIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <circle cx="12" cy="12" r="11" fill="#f97316" stroke="#fff" stroke-width="2"/>
      <g transform="translate(4, 6) scale(0.65)" fill="#fff">
        <circle cx="4" cy="10" r="3" stroke="#fff" stroke-width="1" fill="none"/>
        <circle cx="20" cy="10" r="3" stroke="#fff" stroke-width="1" fill="none"/>
        <path d="M7 10 L10 6 L14 6 L17 10" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M10 6 L11 3 L14 3" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <circle cx="16" cy="5" r="1.5" fill="#fff"/>
      </g>
    </svg>
  `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
});

// Paid parking / parking meter icon (green with dollar sign)
const paidParkingIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <circle cx="12" cy="12" r="11" fill="#10b981" stroke="#fff" stroke-width="2"/>
      <text x="12" y="17" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="Arial">$</text>
    </svg>
  `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
});

// Function to determine the appropriate icon based on feature properties
function getMarkerIcon(properties) {
    const description = properties.DESCRIPTION_RPA || '';
    const category = properties.DESCRIPTION_CAT || '';

    // Check for motorcycle parking (\\P RESERVE MOTOS)
    if (description.includes('RESERVE MOTOS')) {
        return motorcycleIcon;
    }

    // Check for paid parking (STAT-$ category or PARCOMETRE)
    if (category.startsWith('STAT-$') || description === 'PARCOMETRE') {
        return paidParkingIcon;
    }

    // Default parking icon
    return parkingIcon;
}

export default function ParkingMarker({ feature }) {
    const { properties, geometry } = feature;
    const position = [geometry.coordinates[1], geometry.coordinates[0]];

    // Parse and clean up the description
    const description = properties.DESCRIPTION_RPA?.replace(/\\\\P\s*/g, '🅿 ') || 'No description';

    // Get the appropriate icon
    const icon = getMarkerIcon(properties);

    return (
        <Marker position={position} icon={icon}>
            <Popup>
                <div className="parking-popup">
                    <h3 className="popup-title">{properties.DESCRIPTION_CAT || 'Parking'}</h3>
                    <p className="popup-description">{description}</p>
                    <p className="popup-borough">📍 {properties.NOM_ARROND || 'Unknown'}</p>
                    {properties.DESCRIPTION_REP && (
                        <p className="popup-status">Status: {properties.DESCRIPTION_REP}</p>
                    )}
                </div>
            </Popup>
        </Marker>
    );
}
