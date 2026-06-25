"""
Feature extraction from raw keystroke events.
Converts keydown/keyup timestamps to the 92-dimensional feature vector.
"""
from typing import List, Dict, Any
import numpy as np
from utils.logger import logger

class KeystrokeFeatureExtractor:
    """
    Extract features from keystroke events matching the GREYC-NISLAB dataset format.
    
    Features:
    - Press-to-Press (PP) times
    - Release-to-Release (RR) times  
    - Press-to-Release (PR) times (hold durations)
    - Release-to-Press (RP) times
    """
    
    def __init__(self):
        self.feature_count = 92
    
    def extract_features(self, keystroke_events: List[Dict[str, Any]]) -> List[float]:
        """
        Extract 92 features from raw keystroke events.
        
        Args:
            keystroke_events: List of events with 'key', 'type' (down/up), 'timestamp'
            
        Returns:
            List of 92 float features
        """
        try:
            if not keystroke_events:
                logger.warning("No keystroke events provided")
                return [0.0] * self.feature_count
            
            logger.info(f"Processing {len(keystroke_events)} events")
            
            # Sort events by timestamp
            events = sorted(keystroke_events, key=lambda x: x['timestamp'])
            logger.info(f"Sorted {len(events)} events by timestamp")
            
            # Group by key
            key_events = {}
            for event in events:
                key = event.get('key', '')
                event_type = event.get('type', '')
                
                if not key or event_type not in ['keydown', 'keyup']:
                    logger.warning(f"Skipping invalid event: {event}")
                    continue
                
                if key not in key_events:
                    key_events[key] = {'down': [], 'up': []}
                
                if event_type == 'keydown':
                    key_events[key]['down'].append(event['timestamp'])
                elif event_type == 'keyup':
                    key_events[key]['up'].append(event['timestamp'])
            
            logger.info(f"Grouped events into {len(key_events)} keys")
            
            # Calculate features
            features = []
            
            # Get list of keys in order of first appearance
            ordered_keys = []
            seen = set()
            for event in events:
                key = event.get('key', '')
                if key and key not in seen:
                    seen.add(key)
                    ordered_keys.append(key)
            
            logger.info(f"Processing keys in order: {ordered_keys[:10]}...")  # Show first 10 keys
            
            # For each key, compute features
            for i, key in enumerate(ordered_keys):
                events_for_key = key_events.get(key, {'down': [], 'up': []})
                down_times = events_for_key['down']
                up_times = events_for_key['up']
                
                # Need at least one down/up pair
                n_pairs = min(len(down_times), len(up_times))
                
                for j in range(n_pairs):
                    down_time = down_times[j]
                    up_time = up_times[j]
                    
                    # Press-to-Release (PR) - hold time
                    features.append(up_time - down_time)
                    
                    # Press-to-Press (PP) - time between consecutive presses
                    if j > 0 and j < len(down_times):
                        features.append(down_time - down_times[j-1])
                    
                    # Release-to-Release (RR) - time between consecutive releases
                    if j > 0 and j < len(up_times):
                        features.append(up_time - up_times[j-1])
                    
                    # Release-to-Press (RP) - time between release and next press
                    if j < n_pairs - 1 and j+1 < len(down_times):
                        features.append(down_times[j+1] - up_time)
            
            logger.info(f"Extracted {len(features)} raw features")
            
            # Pad or truncate to exactly 92 features
            while len(features) < self.feature_count:
                features.append(0.0)
            
            result = features[:self.feature_count]
            logger.info(f"Final feature vector length: {len(result)}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error extracting features: {str(e)}")
            # Return zeros as fallback
            return [0.0] * self.feature_count