import numpy as np
from typing import List, Dict, Any

def validate_features(features: List[float], expected_count: int) -> Dict[str, Any]:
    """Validate feature vector length and values"""
    if len(features) != expected_count:
        return {
            "valid": False,
            "error": f"Expected {expected_count} features, got {len(features)}"
        }
    
    # Check for NaN or infinite values
    if not all(np.isfinite(f) for f in features):
        return {
            "valid": False,
            "error": "Feature vector contains NaN or infinite values"
        }
    
    return {"valid": True}

def prepare_features(features: List[float]) -> np.ndarray:
    """Convert features to numpy array and reshape for model input"""
    return np.array(features).reshape(1, -1)