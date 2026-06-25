from pydantic import BaseModel
from typing import List, Dict, Any

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