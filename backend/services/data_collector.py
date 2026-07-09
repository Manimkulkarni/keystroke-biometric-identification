import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from utils.logger import logger
from services.supabase_client import supabase_client

# Feature version - increment when feature extraction changes
FEATURE_VERSION = 2

class DataCollector:
    """Collect and store browser keystroke data in Supabase"""
    
    def __init__(self):
        self.table = "keystrokes"
        self.feature_version = FEATURE_VERSION
    
    def validate_features(self, features: List[float], phrase: str = "") -> tuple:
        """
        Smart validation for feature vectors
        
        Returns: (is_valid, errors, warnings)
        """
        errors = []
        warnings = []
        
        # 1. Check length
        if len(features) != 92:
            errors.append(f"Expected 92 features, got {len(features)}")
            return False, errors, warnings
        
        # 2. Check for extreme values
        import numpy as np
        if not all(np.isfinite(f) for f in features):
            errors.append("Contains NaN or infinite values")
            return False, errors, warnings
        
        # 3. Check for all zeros (bad data)
        if all(f == 0 for f in features):
            errors.append("All features are zero")
            return False, errors, warnings
        
        # 4. Smart validation with thresholds
        # Count features by type for analysis
        pp_features = features[:21]  # Press-to-Press
        rr_features = features[21:42]  # Release-to-Release
        pr_features = features[42:64]  # Press-to-Release
        rp_features = features[64:85]  # Release-to-Press
        
        # Check PP (should be positive, reasonable range)
        pp_negatives = sum(1 for f in pp_features if f < 0)
        pp_extreme = sum(1 for f in pp_features if abs(f) > 10000000)
        if pp_negatives > 5:
            warnings.append(f"Many negative PP values ({pp_negatives})")
        if pp_extreme > 3:
            warnings.append(f"Extreme PP values ({pp_extreme})")
        
        # Check RR (should be positive, reasonable range)
        rr_negatives = sum(1 for f in rr_features if f < 0)
        rr_extreme = sum(1 for f in rr_features if abs(f) > 10000000)
        if rr_negatives > 5:
            warnings.append(f"Many negative RR values ({rr_negatives})")
        if rr_extreme > 3:
            warnings.append(f"Extreme RR values ({rr_extreme})")
        
        # Check PR (hold times - should be positive, 30-1000ms range)
        pr_zeros = sum(1 for f in pr_features if f == 0)
        pr_extreme_low = sum(1 for f in pr_features if 0 < f < 300000)  # <30ms
        pr_extreme_high = sum(1 for f in pr_features if f > 5000000)  # >500ms
        if pr_zeros > 3:
            warnings.append(f"Too many zero PR values ({pr_zeros})")
        if pr_extreme_low > 5:
            warnings.append(f"Many very short holds ({pr_extreme_low})")
        if pr_extreme_high > 5:
            warnings.append(f"Many very long holds ({pr_extreme_high})")
        
        # Check RP (Release-to-Press - CAN be negative for overlapping keystrokes)
        rp_extreme_negative = sum(1 for f in rp_features if f < -5000000)  # <-500ms
        rp_extreme_positive = sum(1 for f in rp_features if f > 10000000)  # >1000ms
        if rp_extreme_negative > 3:
            warnings.append(f"Extreme negative RP values ({rp_extreme_negative})")
        if rp_extreme_positive > 3:
            warnings.append(f"Extreme positive RP values ({rp_extreme_positive})")
        
        # 5. Overall quality score (0-100)
        quality_score = 100
        quality_score -= len(warnings) * 5
        quality_score -= len(errors) * 10
        quality_score = max(0, min(100, quality_score))
        
        is_valid = len(errors) == 0
        
        return is_valid, errors, warnings, quality_score
    
    def store_keystroke(self, data: Dict[str, Any]) -> Dict:
        """
        Store a keystroke sample in Supabase with enhanced metadata
        """
        features = data.get("features", [])
        phrase = data.get("phrase", "")
        is_valid, errors, warnings, quality_score = self.validate_features(features, phrase)
        
        # Generate anonymous user ID if not provided
        user_id = data.get("user_id")
        if not user_id:
            user_id = str(uuid.uuid4())
        
        # Prepare record for Supabase
        record = {
            "user_id": user_id,
            "features": features,
            "phrase": phrase,
            "style": data.get("style", "normal"),
            "feature_version": self.feature_version,
            "source": data.get("source", "browser"),
            "browser": data.get("browser", "unknown"),
            "os": data.get("os", "unknown"),
            "keyboard_layout": data.get("keyboard_layout", "unknown"),
            "typing_speed": data.get("typing_speed"),
            "hold_time_avg": data.get("hold_time_avg"),
            "flight_time_avg": data.get("flight_time_avg"),
            "is_valid": is_valid,
            "validation_errors": errors if errors else None,
            "validation_warnings": warnings if warnings else None,
            "quality_score": quality_score
        }
        
        try:
            response = supabase_client.table(self.table).insert(record).execute()
            
            if response.data:
                sample_id = response.data[0]["id"]
                logger.info(f"Stored keystroke {sample_id} (quality: {quality_score}%)")
                
                return {
                    "success": True,
                    "sample_id": sample_id,
                    "is_valid": is_valid,
                    "quality_score": quality_score,
                    "errors": errors,
                    "warnings": warnings
                }
            else:
                return {
                    "success": False,
                    "error": "No data returned from insert"
                }
                
        except Exception as e:
            logger.error(f"Failed to store keystroke: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_stats(self) -> Dict:
        """Get comprehensive database statistics"""
        try:
            # Get all data
            response = supabase_client.table(self.table).select("*").execute()
            data = response.data
            
            if not data:
                return {
                    "total_samples": 0,
                    "unique_users": 0,
                    "sources": {},
                    "browsers": {},
                    "os": {},
                    "phrases": {},
                    "styles":{},
                    "avg_typing_speed": 0,
                    "avg_hold_time": 0,
                    "avg_flight_time": 0,
                    "quality_score_avg": 0,
                    "recent_days": {}
                }
            
            # Calculate stats
            users = set()
            sources = {}
            browsers = {}
            os_counts = {}
            phrases = {}
            styles = {}
            typing_speeds = []
            hold_times = []
            flight_times = []
            quality_scores = []
            dates = {}
            
            for row in data:
                users.add(row.get("user_id"))
                
                source = row.get("source", "unknown")
                sources[source] = sources.get(source, 0) + 1
                
                browser = row.get("browser", "unknown")
                browsers[browser] = browsers.get(browser, 0) + 1
                
                os_platform = row.get("os", "unknown")
                os_counts[os_platform] = os_counts.get(os_platform, 0) + 1

                style = row.get("style", "normal")
                styles[style] = styles.get(style, 0) + 1
                
                phrase = row.get("phrase", "unknown")
                phrases[phrase] = phrases.get(phrase, 0) + 1
                
                if row.get("typing_speed"):
                    typing_speeds.append(row["typing_speed"])
                if row.get("hold_time_avg"):
                    hold_times.append(row["hold_time_avg"])
                if row.get("flight_time_avg"):
                    flight_times.append(row["flight_time_avg"])
                if row.get("quality_score"):
                    quality_scores.append(row["quality_score"])
                
                date = row.get("created_at", "").split("T")[0] if row.get("created_at") else ""
                if date:
                    dates[date] = dates.get(date, 0) + 1
            
            return {
                "total_samples": len(data),
                "unique_users": len(users),
                "sources": sources,
                "browsers": browsers,
                "os": os_counts,
                "phrases": phrases,
                "avg_typing_speed": round(sum(typing_speeds) / len(typing_speeds), 1) if typing_speeds else 0,
                "avg_hold_time": round(sum(hold_times) / len(hold_times), 1) if hold_times else 0,
                "avg_flight_time": round(sum(flight_times) / len(flight_times), 1) if flight_times else 0,
                "avg_quality_score": round(sum(quality_scores) / len(quality_scores), 1) if quality_scores else 0,
                "recent_days": dict(sorted(dates.items(), reverse=True)[:7])
            }
            
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {
                "total_samples": 0,
                "unique_users": 0,
                "sources": {},
                "browsers": {},
                "os": {},
                "phrases": {},
                "avg_typing_speed": 0,
                "avg_hold_time": 0,
                "avg_flight_time": 0,
                "avg_quality_score": 0,
                "recent_days": {}
            }

# Singleton instance
data_collector = DataCollector()