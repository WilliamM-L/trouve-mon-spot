# Parking Backend

A Rust HTTP server that provides fast spatial queries for Montreal parking sign data using a KD-Tree index.

## Prerequisites

- Rust 1.92+ (update with `rustup update stable`)
- The GeoJSON data file at `/home/inscius/code/street_parking/data/signalisation_stationnement.geojson.json`

## Build

```bash
cargo build --release
```

## Run

```bash
./target/release/parking-backend
```

The server starts on `http://localhost:3000`.

At startup, it:
1. Loads ~171,000 parking sign features from GeoJSON
2. Builds a KD-Tree spatial index
3. Listens for HTTP requests

## API

### GET /nearby

Returns parking signs within a radius of a location.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `lat` | float | Latitude (e.g., 45.55) |
| `lon` | float | Longitude (e.g., -73.57) |
| `radius` | float | Radius in meters |

**Example:**
```bash
curl "http://localhost:3000/nearby?lat=45.55&lon=-73.57&radius=100"
```

**Response:**
```json
{
  "count": 51,
  "features": [
    {
      "type": "Feature",
      "properties": {
        "DESCRIPTION_RPA": "\\P 09h-10h LUN. 1 MARS AU 1 DEC.",
        "Latitude": 45.549964,
        "Longitude": -73.570082,
        ...
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-73.570082, 45.549964]
      }
    }
  ]
}
```

### GET /health

Health check endpoint. Returns `OK`.

## Architecture

- **Framework**: axum (async HTTP)
- **Spatial Index**: kiddo (KD-Tree)
- **Distance**: Haversine formula for accurate meter-based filtering
