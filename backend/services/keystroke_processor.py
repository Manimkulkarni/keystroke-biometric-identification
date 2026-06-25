"""
High-level processor that takes raw keystroke events and returns predictions.
"""
from typing import List, Dict, Any
from services.feature_extractor import KeystrokeFeatureExtractor
from services.predictor import predictor
from utils.logger import logger

class KeystrokeProcessor:
    """
    End-to-end keystroke processing: from raw events to prediction.
    """
    
    def __init__(self):
        self.extractor = KeystrokeFeatureExtractor()
    
    def process_and_predict(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process raw keystroke events and return prediction.
        
        Args:
            events: List of keydown/keyup events with timestamps
            
        Returns:
            Prediction result from the model
        """
        try:
            logger.info(f"Processing {len(events)} keystroke events")
            
            # Validate events
            if not events:
                return {"error": "No keystroke events provided"}
            
            # Extract features
            features = self.extractor.extract_features(events)
            
            logger.info(f"Extracted {len(features)} features")
            logger.info(f"First 10 features: {features[:10]}")
            
            # Check if any features are non-zero (to ensure extraction worked)
            if all(f == 0 for f in features):
                logger.warning("All features are zero - extraction may have failed")
            
            # Make prediction
            result = predictor.predict(features)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in keystroke processing: {str(e)}")
            return {"error": f"Failed to process keystrokes: {str(e)}"}

# Create singleton
processor = KeystrokeProcessor()

def process_and_predict(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Convenience function for keystroke event prediction"""
    return processor.process_and_predict(events)