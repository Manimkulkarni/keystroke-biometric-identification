import joblib
import numpy as np
from typing import List, Dict, Any
from config import MODEL_PATH, LABEL_ENCODER_PATH, METADATA_PATH
from services.preprocessing import validate_features, prepare_features
from utils.logger import logger

class Predictor:
    """Singleton predictor class for keystroke biometric identification"""
    
    _instance = None
    _model = None
    _label_encoder = None
    _metadata = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_models()
        return cls._instance
    
    def _load_models(self):
        """Load all required models and artifacts"""
        try:
            self._model = joblib.load(MODEL_PATH)
            self._label_encoder = joblib.load(LABEL_ENCODER_PATH)
            self._metadata = joblib.load(METADATA_PATH)
            logger.info("Models loaded successfully")
            logger.info(f"Model metadata: {self._metadata}")
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise
    
    def predict(self, features: List[float]) -> Dict[str, Any]:
        """
        Make a prediction using the loaded model
        
        Args:
            features: List of 92 feature values
            
        Returns:
            Dictionary with prediction results
        """
        # Validate features
        validation = validate_features(features, self._metadata["feature_count"])
        if not validation["valid"]:
            logger.warning(f"Validation failed: {validation['error']}")
            return {"error": validation["error"]}
        
        # Prepare input
        x = prepare_features(features)
        
        # Get probabilities
        probs = self._model.predict_proba(x)[0]
        
        # Get top 5 indices
        top5_idx = np.argsort(probs)[::-1][:5]
        
        # Build top 5 predictions
        top5 = []
        for idx in top5_idx:
            user_id = int(self._label_encoder.inverse_transform([idx])[0])
            confidence = round(float(probs[idx]), 4)
            top5.append({
                "user_id": user_id,
                "confidence": confidence
            })
        
        logger.info(f"Prediction made: top user {top5[0]['user_id']} with confidence {top5[0]['confidence']}")
        
        return {
            "predicted_user": top5[0]["user_id"],
            "confidence": top5[0]["confidence"],
            "top5_predictions": top5
        }
    
    @property
    def metadata(self):
        return self._metadata

# Create singleton instance
predictor = Predictor()

# Convenience function for backward compatibility
def predict(features: List[float]) -> Dict[str, Any]:
    return predictor.predict(features)