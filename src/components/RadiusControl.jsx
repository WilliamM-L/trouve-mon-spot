export default function RadiusControl({ radius, onChange, min = 100, max = 2000, step = 100 }) {
    return (
        <div className="radius-control">
            <div className="radius-header">
                <span className="radius-label">Search Radius</span>
                <span className="radius-value">{radius}m</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={radius}
                onChange={(e) => onChange(Number(e.target.value))}
                className="radius-slider"
            />
            <div className="radius-range">
                <span>{min}m</span>
                <span>{max}m</span>
            </div>
        </div>
    );
}
