import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
from pathlib import Path
from collections import Counter


BASE_DIR = Path(__file__).resolve().parent


def train_browser_model():
    """Train a model on browser-collected data"""
    
    # Load data
    data_path = BASE_DIR / "data" / "exported" / "browser_data.csv"
    
    if not data_path.exists():
        print("ℹ️ No browser data found. Skipping browser model training.")
        return
    
    df = pd.read_csv(data_path)
    
    print("=" * 60)
    print("PHASE 3: BROWSER MODEL TRAINING")
    print("=" * 60)
    
    print(f"\n📊 Dataset Overview:")
    print(f"   Total samples: {len(df)}")
    print(f"   Unique users: {df['user_id'].nunique()}")
    print(f"   Styles: {df['style'].unique().tolist()}")
    
    # Check if we have enough data
    if len(df) < 10:
        print(f"⚠️ Not enough browser data ({len(df)} samples). Need at least 10.")
        return
    
    # Prepare features and labels
    feature_cols = [c for c in df.columns if c.startswith("F")]
    X = df[feature_cols].values
    y = df["user_id"].values
    
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    print(f"\n🔢 Feature matrix: {X.shape}")
    print(f"   Users: {len(le.classes_)}")
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"\n📊 Train/Test split:")
    print(f"   Training: {len(X_train)} samples")
    print(f"   Testing: {len(X_test)} samples")
    
    # Train Random Forest
    print("\n🤖 Training Random Forest...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n✅ Browser Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Cross-validation
    cv_scores = cross_val_score(model, X, y_encoded, cv=min(5, len(np.unique(y_encoded))))
    print(f"   Cross-validation (mean): {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
    
    # Save model
    model_dir = BASE_DIR / "models"
    model_dir.mkdir(exist_ok=True)
    
    joblib.dump(model, model_dir / "browser_model.pkl")
    joblib.dump(le, model_dir / "browser_label_encoder.pkl")
    
    # Save metadata
    metadata = {
        "model_name": "RandomForest_Browser",
        "accuracy": accuracy,
        "cv_mean": cv_scores.mean(),
        "cv_std": cv_scores.std(),
        "n_samples": len(df),
        "n_users": df["user_id"].nunique(),
        "n_features": len(feature_cols),
        "source": "browser",
        "styles": df["style"].unique().tolist()
    }
    joblib.dump(metadata, model_dir / "browser_model_metadata.pkl")
    
    print("\n✅ Model saved to models/browser_model.pkl")
    
    return model, accuracy, le


def train_style_models(df):
    """Train separate models for each typing style"""
    
    print("\n" + "=" * 60)
    print("STYLE-SPECIFIC MODELS")
    print("=" * 60)
    
    styles = df['style'].unique()
    results = {}
    feature_cols = [c for c in df.columns if c.startswith("F")]
    
    for style in styles:
        style_df = df[df['style'] == style]
        
        if len(style_df) < 5:
            print(f"\n⚠️ Not enough data for {style} (only {len(style_df)} samples)")
            continue
        
        X = style_df[feature_cols].values
        y = style_df["user_id"].values
        
        # Encode
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        
        if len(np.unique(y_encoded)) < 2:
            print(f"\n⚠️ Not enough users for {style} (only 1 user)")
            continue
        
        # Train
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        try:
            # Cross-validation
            cv_scores = cross_val_score(model, X, y_encoded, cv=min(3, len(np.unique(y_encoded))))
            
            results[style] = {
                "cv_mean": cv_scores.mean(),
                "cv_std": cv_scores.std(),
                "n_samples": len(style_df),
                "n_users": style_df["user_id"].nunique()
            }
            
            print(f"\n📊 {style}:")
            print(f"   Samples: {len(style_df)}")
            print(f"   Users: {style_df['user_id'].nunique()}")
            print(f"   CV Accuracy: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
            
        except Exception as e:
            print(f"\n⚠️ Could not train {style}: {e}")
    
    return results


if __name__ == "__main__":
    # Load data
    data_path = BASE_DIR / "data" / "exported" / "browser_data.csv"

    if not data_path.exists():
        print("ℹ️ No browser data found. Skipping browser model training.")
    else:
        df = pd.read_csv(data_path)

        # Train main model
        model, accuracy, le = train_browser_model()

        # Train style-specific models
        style_results = train_style_models(df)