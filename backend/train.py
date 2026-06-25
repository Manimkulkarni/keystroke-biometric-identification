import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from config import DATA_DIR, MODEL_DIR, FEATURE_COUNT, PASSWORD, MODEL_NAME

DATA_PATH = DATA_DIR / "GREYC-NISLABKeystrokeBenchmarkDatasetSyed.xlsx"

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
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Train model
    print("Training Random Forest...")
    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    
    # Save artifacts
    print("Saving artifacts...")
    MODEL_DIR.mkdir(exist_ok=True)
    
    joblib.dump(model, MODEL_DIR / "typeprint_p5_model.pkl")
    joblib.dump(le, MODEL_DIR / "label_encoder.pkl")
    joblib.dump({
        "feature_count": X.shape[1],
        "password": PASSWORD,
        "model_name": MODEL_NAME,
        "accuracy": round(acc, 4),
        "classes": le.classes_.tolist(),
        "n_classes": len(le.classes_)
    }, MODEL_DIR / "model_metadata.pkl")
    
    print(" Model saved successfully!")

if __name__ == "__main__":
    train()