/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Filter GeoJSON features by distance from center point
 * @param {Array} features - GeoJSON features array
 * @param {Object} center - Center point {lat, lng}
 * @param {number} radiusMeters - Radius in meters
 * @returns {Array} Filtered features within radius
 */
export function filterByRadius(features, center, radiusMeters) {
    if (!center || !features) return [];

    return features.filter(feature => {
        const coords = feature.geometry.coordinates;
        const distance = calculateDistance(
            center.lat,
            center.lng,
            coords[1], // latitude
            coords[0]  // longitude
        );
        return distance <= radiusMeters;
    });
}
