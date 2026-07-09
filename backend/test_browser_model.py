import joblib
import numpy as np
import pandas as pd
from pathlib import Path

def test_browser_model():
    """Test the browser model on a sample"""
    
    # Load model
    try:
        model = joblib.load("models/browser_model.pkl")
        le = joblib.load("models/browser_label_encoder.pkl")
        print("✅ Loaded browser model")
    except:
        print("❌ No browser model found")
        return
    
    # Load a sample from exported data
    data_path = Path("data/exported/browser_data.csv")
    if not data_path.exists():
        print("❌ No browser data found")
        return
    
    df = pd.read_csv(data_path)
    feature_cols = [c for c in df.columns if c.startswith("F")]
    
    # Take first sample
    sample = df.iloc[0]
    features = sample[feature_cols].values.reshape(1, -1)
    true_user = sample["user_id"]
    
    # Predict
    pred_encoded = model.predict(features)[0]
    pred_user = le.inverse_transform([pred_encoded])[0]
    proba = model.predict_proba(features)[0]
    confidence = max(proba)
    
    print("\n" + "=" * 60)
    print("BROWSER MODEL TEST")
    print("=" * 60)
    print(f"\nTrue user: {true_user}")
    print(f"Predicted user: {pred_user}")
    print(f"Confidence: {confidence:.2%}")
    print(f"Match: {'✅ YES' if pred_user == true_user else '❌ NO'}")
    
    # Show top 5 predictions
    top5_idx = np.argsort(proba)[::-1][:5]
    top5_users = le.inverse_transform(top5_idx)
    
    print(f"\nTop 5 Predictions:")
    for i, (user, prob) in enumerate(zip(top5_users, proba[top5_idx])):
        print(f"   {i+1}. User {user} ({prob:.2%})")

if __name__ == "__main__":
    test_browser_model()