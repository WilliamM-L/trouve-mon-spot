use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use kiddo::{KdTree, SquaredEuclidean};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

const GEOJSON_PATH: &str = "/home/inscius/code/trouve-mon-spot/backend/clean_data/signalisation_stationnement_cleaned.geojson.json";

// GeoJSON structures for parsing
#[derive(Debug, Deserialize)]
struct GeoJsonFeatureCollection {
    features: Vec<GeoJsonFeature>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct GeoJsonFeature {
    #[serde(rename = "type")]
    feature_type: String,
    properties: serde_json::Value,
    geometry: Geometry,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct Geometry {
    #[serde(rename = "type")]
    geometry_type: String,
    coordinates: Vec<f64>,
}

// Query parameters
#[derive(Debug, Deserialize)]
struct NearbyQuery {
    lat: f64,
    lon: f64,
    radius: f64, // in meters
}

// Response structure
#[derive(Debug, Serialize)]
struct NearbyResponse {
    count: usize,
    features: Vec<GeoJsonFeature>,
}

// Application state shared across requests
struct AppState {
    tree: KdTree<f64, 2>,
    features: Vec<GeoJsonFeature>,
}

/// Convert meters to approximate degrees (for Montreal's latitude ~45.5°)
fn meters_to_degrees(meters: f64) -> f64 {
    // At 45.5° latitude:
    // 1 degree latitude ≈ 111,132 meters
    // 1 degree longitude ≈ 78,847 meters
    // We use an average for the KD-tree query
    meters / 95_000.0
}

/// Haversine distance in meters between two lat/lon points
fn haversine_distance(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    const R: f64 = 6_371_000.0; // Earth radius in meters

    let phi1 = lat1.to_radians();
    let phi2 = lat2.to_radians();
    let delta_phi = (lat2 - lat1).to_radians();
    let delta_lambda = (lon2 - lon1).to_radians();

    let a = (delta_phi / 2.0).sin().powi(2)
        + phi1.cos() * phi2.cos() * (delta_lambda / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

    R * c
}

fn load_geojson_and_build_tree() -> (KdTree<f64, 2>, Vec<GeoJsonFeature>) {
    println!("Loading GeoJSON from {}...", GEOJSON_PATH);
    
    let file_content = std::fs::read_to_string(GEOJSON_PATH)
        .expect("Failed to read GeoJSON file");
    
    let geojson: GeoJsonFeatureCollection = serde_json::from_str(&file_content)
        .expect("Failed to parse GeoJSON");
    
    println!("Loaded {} features", geojson.features.len());
    println!("Building KD-Tree...");
    
    let mut tree: KdTree<f64, 2> = KdTree::new();
    
    for (idx, feature) in geojson.features.iter().enumerate() {
        if feature.geometry.coordinates.len() >= 2 {
            let lon = feature.geometry.coordinates[0];
            let lat = feature.geometry.coordinates[1];
            // Store as [lat, lon] for geographic queries
            tree.add(&[lat, lon], idx as u64);
        }
    }
    
    println!("KD-Tree built with {} entries", tree.size());
    
    (tree, geojson.features)
}

async fn nearby_handler(
    State(state): State<Arc<AppState>>,
    Query(params): Query<NearbyQuery>,
) -> Result<Json<NearbyResponse>, StatusCode> {
    let query_point = [params.lat, params.lon];
    let radius_degrees = meters_to_degrees(params.radius);
    
    // Query KD-tree for candidates within squared euclidean distance
    let radius_squared = radius_degrees * radius_degrees;
    let candidates = state.tree.within::<SquaredEuclidean>(&query_point, radius_squared);
    
    // Filter with precise Haversine distance
    let mut nearby_features: Vec<GeoJsonFeature> = Vec::new();
    
    for candidate in candidates {
        let idx = candidate.item as usize;
        if idx < state.features.len() {
            let feature = &state.features[idx];
            let lon = feature.geometry.coordinates[0];
            let lat = feature.geometry.coordinates[1];
            
            let dist = haversine_distance(params.lat, params.lon, lat, lon);
            if dist <= params.radius {
                nearby_features.push(feature.clone());
            }
        }
    }
    
    Ok(Json(NearbyResponse {
        count: nearby_features.len(),
        features: nearby_features,
    }))
}

async fn health_handler() -> &'static str {
    "OK"
}

#[tokio::main]
async fn main() {
    let (tree, features) = load_geojson_and_build_tree();
    
    let state = Arc::new(AppState { tree, features });
    
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);
    
    let app = Router::new()
        .route("/nearby", get(nearby_handler))
        .route("/health", get(health_handler))
        .layer(cors)
        .with_state(state);
    
    let addr = "0.0.0.0:3000";
    println!("Server listening on http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
