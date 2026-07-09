from pydantic import BaseModel
from typing import List, Dict, Any
from typing import Optional, List

class PredictionRequest(BaseModel):
    features: List[float]

class KeystrokeEvent(BaseModel):
    key: str
    type: str  # 'keydown' or 'keyup'
    timestamp: float
    charCode: int

class KeystrokeEventsRequest(BaseModel):
    events: List[KeystrokeEvent]

class Prediction(BaseModel):
    user_id: int
    confidence: float

class PredictionResponse(BaseModel):
    predicted_user: int
    confidence: float
    top5_predictions: List[Prediction]

class StoreKeystrokeRequest(BaseModel):
    user_id: Optional[str] = None  # Now UUID
    features: List[float]
    phrase: str = "united states of america"
    style: str = "normal" 
    user_agent: Optional[str] = None
    typing_speed: Optional[float] = None
    hold_time_avg: Optional[float] = None
    flight_time_avg: Optional[float] = None

class DatasetStatsResponse(BaseModel):
    total_samples: int
    unique_users: int
    sources: dict
    browsers: dict
    os: dict
    phrases: dict
    avg_typing_speed: float
    avg_hold_time: float
    avg_flight_time: float
    avg_quality_score: float
    recent_days: dict