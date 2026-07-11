from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictionRequest, KeystrokeEventsRequest, PredictionResponse
from services.predictor import predictor
from services.keystroke_processor import process_and_predict
from utils.logger import logger
from utils.error_handler import safe_predict
from schemas import StoreKeystrokeRequest
from services.data_collector import data_collector
import sys
from pathlib import Path

# Run startup script


app = FastAPI(
    title="TypePrint API",
    description="Keystroke Biometric Identification API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to handle prediction logic
def handle_prediction(prediction_func, *args, **kwargs):
    """Common error handling for prediction endpoints"""
    try:
        result = prediction_func(*args, **kwargs)
        
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/")
def root():
    return {
        "name": "TypePrint API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/metadata")
def get_metadata():
    metadata = predictor.metadata
    return {
        "model": metadata.get("model_name", "RandomForest"),
        "accuracy": metadata.get("accuracy", 0.0),
        "feature_count": metadata.get("feature_count", 92),
        "password": metadata.get("password", "united states of america"),
        "users": len(metadata.get("classes", [])) if "classes" in metadata else 110
    }

@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    logger.info(f"Received feature prediction request with {len(data.features)} features")
    return safe_predict(predictor.predict, data.features)

@app.post("/api/v1/predict-from-keystrokes", response_model=PredictionResponse)
def predict_from_keystrokes(data: KeystrokeEventsRequest):
    logger.info(f"Received keystroke prediction request with {len(data.events)} events")
    return safe_predict(process_and_predict, data.events)

@app.post("/api/v1/store-keystroke")
async def store_keystroke(data: StoreKeystrokeRequest):
    """
    Store a keystroke sample from the browser
    """
    if len(data.features) != 92:
        raise HTTPException(status_code=400, detail=f"Expected 92 features, got {len(data.features)}")
    
    # Parse user agent
    user_agent = data.user_agent or ""
    browser = "unknown"
    os_platform = "unknown"
    
    if "Chrome" in user_agent:
        browser = "Chrome"
    elif "Firefox" in user_agent:
        browser = "Firefox"
    elif "Safari" in user_agent:
        browser = "Safari"
    elif "Edge" in user_agent:
        browser = "Edge"
    
    if "Windows" in user_agent:
        os_platform = "Windows"
    elif "Mac" in user_agent:
        os_platform = "macOS"
    elif "Linux" in user_agent:
        os_platform = "Linux"
    elif "Android" in user_agent:
        os_platform = "Android"
    elif "iPhone" in user_agent or "iPad" in user_agent:
        os_platform = "iOS"
    
    # Store in Supabase with enhanced data
    result = data_collector.store_keystroke({
        "user_id": data.user_id,  # UUID or None (will generate)
        "features": data.features,
        "phrase": data.phrase,
        "style": data.style, 
        "source": "browser",
        "browser": browser,
        "os": os_platform,
        "typing_speed": data.typing_speed,
        "hold_time_avg": data.hold_time_avg,
        "flight_time_avg": data.flight_time_avg
    })
    
    if result.get("success"):
        return {
            "success": True,
            "sample_id": result["sample_id"],
            "quality_score": result["quality_score"],
            "is_valid": result["is_valid"],
            "warnings": result.get("warnings", []),
            "message": f"Keystroke stored (ID: {result['sample_id']})"
        }
    else:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to store keystroke"))
    
@app.get("/api/v1/db-stats")
async def db_stats():
    """Get database statistics"""
    return data_collector.get_stats()

@app.get("/api/v1/samples")
async def get_samples(limit: int = 100, source: str = None):
    """Get recent samples"""
    return data_collector.get_samples(limit=limit, source=source)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)

