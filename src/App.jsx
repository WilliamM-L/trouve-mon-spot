import { useState, useEffect } from 'react';
import Map from './components/Map';
import RadiusControl from './components/RadiusControl';
import { useGeolocation } from './hooks/useGeolocation';

const API_BASE_URL = 'http://localhost:3000';

export default function App() {
    const { location, error, loading } = useGeolocation();
    const [radius, setRadius] = useState(500);
    const [filteredData, setFilteredData] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    // Fetch nearby parking data from backend when location or radius changes
    useEffect(() => {
        if (!location) return;

        setDataLoading(true);
        const url = `${API_BASE_URL}/nearby?lat=${location.lat}&lon=${location.lng}&radius=${radius}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                setFilteredData(data.features || []);
                setDataLoading(false);
            })
            .catch(err => {
                console.error('Failed to load parking data:', err);
                setFilteredData([]);
                setDataLoading(false);
            });
    }, [location, radius]);

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <h1>🚗💨 Trouve Mon Spot</h1>
                <span className="badge">{filteredData.length} signs nearby</span>
            </header>

            {/* Error message */}
            {error && (
                <div className="error-banner">
                    ⚠️ {error} - Using default location
                </div>
            )}

            {/* Map */}
            <main className="main">
                {dataLoading || loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading parking data...</p>
                    </div>
                ) : (
                    <Map center={location} radius={radius} parkingData={filteredData} />
                )}
            </main>

            {/* Radius control */}
            <footer className="footer">
                <RadiusControl radius={radius} onChange={setRadius} />
            </footer>
        </div>
    );
}
