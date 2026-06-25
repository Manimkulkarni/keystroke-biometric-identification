from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Directory paths
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
LOG_DIR = BASE_DIR / "logs"

# Model paths
MODEL_PATH = MODEL_DIR / "typeprint_p5_model.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"
METADATA_PATH = MODEL_DIR / "model_metadata.pkl"

# Model constants
FEATURE_COUNT = 92
PASSWORD = "united states of america"
MODEL_NAME = "RandomForest"

# Create directories if they don't exist
MODEL_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)