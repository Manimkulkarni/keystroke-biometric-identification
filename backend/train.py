import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score


# Get the directory where this script is located
BASE_DIR = Path(__file__).resolve().parent

# Path to the data file
DATA_PATH = BASE_DIR / "data" / "GREYC-NISLABKeystrokeBenchmarkDatasetSyed.xlsx"


def load_p5():
    """Load P5 dataset"""
    df = pd.read_excel(DATA_PATH, sheet_name="P5")
    
    vectors = df["Keystroke Template Vector"].astype(str).apply(
        lambda x: [int(v) for v in x.split()]
    )
    
    X = pd.DataFrame(vectors.tolist())
    y = df["User_ID"]
    
    return X, y


def train():
    """Train and save the model"""
    print("Loading data...")
    X, y = load_p5()
    
    print(f"Data shape: {X.shape}")
    print(f"Unique users: {y.nunique()}")
    
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=y_encoded
    )
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Train model
    print("Training Random Forest...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=30,
        min_samples_split=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    
    # Create models directory
    model_dir = BASE_DIR / "models"
    model_dir.mkdir(exist_ok=True)
    
    # Save artifacts
    print("Saving artifacts with LZMA compression...")
    joblib.dump(model, model_dir / "typeprint_p5_model.pkl", compress=("lzma", 9))
    joblib.dump(le, model_dir / "label_encoder.pkl")
    joblib.dump({
        "feature_count": X.shape[1],
        "password": "united states of america",
        "model_name": "RandomForest (Optimized + LZMA)",
        "accuracy": round(acc, 4),
        "n_estimators": 200,
        "max_depth": 30,
        "classes": le.classes_.tolist(),
        "n_classes": len(le.classes_)
    }, model_dir / "model_metadata.pkl")
    
    import os
    size_mb = os.path.getsize(model_dir / "typeprint_p5_model.pkl") / 1024 / 1024
    print(f"✅ Model saved successfully! ({size_mb:.2f} MB)")

if __name__ == "__main__":
    train()