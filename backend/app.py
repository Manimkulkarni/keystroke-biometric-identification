from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PredictionRequest, KeystrokeEventsRequest, PredictionResponse
from services.predictor import predictor
from services.keystroke_processor import process_and_predict
from utils.logger import logger
from utils.error_handler import safe_predict
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