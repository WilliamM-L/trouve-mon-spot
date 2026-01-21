import { useState, useEffect } from 'react';

/**
 * Custom hook for getting user's geolocation
 * @param {Object} defaultLocation - Fallback location if geolocation fails
 * @returns {Object} { location, error, loading }
 */
export function useGeolocation(defaultLocation = { lat: 45.5017, lng: -73.5673 }) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // DEBUG: Hardcode location to center of Montreal
        setLocation(defaultLocation);
        setLoading(false);
        return;

        // Original geolocation code (disabled for debugging)
        /*
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocation(defaultLocation);
            setLoading(false);
            return;
        }

        const successHandler = (position) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            setLoading(false);
        };

        const errorHandler = (err) => {
            setError(err.message);
            setLocation(defaultLocation);
            setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // Cache for 5 minutes
        });
        */
    }, []);

    return { location, error, loading };
}
