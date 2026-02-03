#!/usr/bin/env python3
"""
Clean the parking signage GeoJSON data:
- Remove entries containing "PANONCEAU EXCEPTE PERIODE INTERDITE"
- Keep only specified properties: DESCRIPTION_RPA, DESCRIPTION_CAT, DESCRIPTION_REP, 
  longitude, latitude, NOM_ARROND
- Preserve geometry
"""

import json
from pathlib import Path

INPUT_FILE = Path(__file__).parent / "signalisation_stationnement.geojson.json"
OUTPUT_DIR = Path("/home/inscius/code/trouve-mon-spot/backend/clean_data")
OUTPUT_FILE = OUTPUT_DIR / "signalisation_stationnement_cleaned.geojson.json"

# Properties to keep
KEEP_PROPERTIES = [
    "DESCRIPTION_RPA",
    "DESCRIPTION_CAT", 
    "DESCRIPTION_REP",
    "longitude",
    "latitude",
    "NOM_ARROND",
]

# Text patterns that indicate entries to remove (include the \P or \A prefix)
REMOVE_PATTERNS = [
    "PANONCEAU EXCEPTE PERIODE INTERDITE",
    "PANONCEAU ZONE DE REMORQUAGE",
    "PANONCEAU DEBAR. SEULEMENT",
    "\\P LIVRAISON SEULEMENT EN TOUT TEMPS",
    "\\P RESERVE TAXIS",
    "\\P EXCEPTE DEBARCADERE AUTOBUS TOURISTIQUE",
    "\\P RESERVE AUTOBUS TOURISTIQUES",
    "\\P RESERVE DEBARCADERE HANDICAPES EN TOUT TEMPS",
    "\\A EXCEPTÉ CORPS CONSULAIRES ET DIPLOMATIQUES",
    "\\P EXCEPTÉ CORPS DIPLOMATIQUES",
    "\\P RESERVE HANDICAPES (PICTO)",
    "\\A EN TOUT TEMPS",
    "\\P EN TOUT TEMPS",
    "EN TOUT TEMPS",  # Catch-all for any variant (S3R, etc.)
]


def should_remove(feature: dict) -> bool:
    """Check if feature should be removed based on DESCRIPTION_RPA."""
    props = feature.get("properties", {})
    description_rpa = props.get("DESCRIPTION_RPA", "")
    
    # Check DESCRIPTION_RPA for removal patterns
    if isinstance(description_rpa, str):
        for pattern in REMOVE_PATTERNS:
            if description_rpa.__contains__(pattern):
                return True
    return False


def clean_properties(feature: dict) -> dict:
    """Keep only specified properties in the feature."""
    old_props = feature.get("properties", {})
    new_props = {k: old_props.get(k) for k in KEEP_PROPERTIES if k in old_props}
    
    return {
        "type": feature.get("type", "Feature"),
        "properties": new_props,
        "geometry": feature.get("geometry"),
    }


def main():
    print(f"Loading {INPUT_FILE}...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    original_count = len(data.get("features", []))
    print(f"Original feature count: {original_count}")
    
    # Filter and clean features
    cleaned_features = []
    removed_count = 0
    
    for feature in data.get("features", []):
        if should_remove(feature):
            removed_count += 1
            continue
        cleaned_features.append(clean_properties(feature))
    
    print(f"Removed {removed_count} features matching exclusion patterns")
    print(f"Remaining features: {len(cleaned_features)}")
    
    # Create output GeoJSON
    output_data = {
        "type": "FeatureCollection",
        "features": cleaned_features,
    }
    
    print(f"Writing to {OUTPUT_FILE}...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False)
    
    print("Done!")


if __name__ == "__main__":
    main()
