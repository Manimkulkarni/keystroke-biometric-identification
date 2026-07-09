import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, classification_report
from pathlib import Path

def compare_models():
    """Compare GREYC vs Browser models"""
    
    print("=" * 60)
    print("MODEL COMPARISON")
    print("=" * 60)
    
    # Load both models
    models = {}
    
    # GREYC Model
    try:
        greyc_model = joblib.load("models/typeprint_p5_model.pkl")
        greyc_le = joblib.load("models/label_encoder.pkl")
        greyc_meta = joblib.load("models/model_metadata.pkl")
        models["GREYC"] = {
            "model": greyc_model,
            "le": greyc_le,
            "accuracy": greyc_meta.get("accuracy", 0),
            "samples": greyc_meta.get("n_samples", 2200),
            "users": greyc_meta.get("n_classes", 110)
        }
        print("✅ Loaded GREYC model")
    except Exception as e:
        print(f"⚠️ Could not load GREYC model: {e}")
    
    # Browser Model
    try:
        browser_model = joblib.load("models/browser_model.pkl")
        browser_le = joblib.load("models/browser_label_encoder.pkl")
        browser_meta = joblib.load("models/browser_model_metadata.pkl")
        models["Browser"] = {
            "model": browser_model,
            "le": browser_le,
            "accuracy": browser_meta.get("accuracy", 0),
            "samples": browser_meta.get("n_samples", 0),
            "users": browser_meta.get("n_users", 0)
        }
        print("✅ Loaded Browser model")
    except Exception as e:
        print(f"⚠️ Could not load Browser model: {e}")
    
    # Print comparison
    print("\n" + "=" * 60)
    print("COMPARISON TABLE")
    print("=" * 60)
    
    comparison_data = []
    for name, info in models.items():
        comparison_data.append({
            "Model": name,
            "Accuracy": f"{info['accuracy']*100:.2f}%",
            "Samples": info['samples'],
            "Users": info['users']
        })
    
    df = pd.DataFrame(comparison_data)
    print(df.to_string(index=False))
    
    # Analysis
    print("\n" + "=" * 60)
    print("ANALYSIS")
    print("=" * 60)
    
    if "GREYC" in models and "Browser" in models:
        greyc_acc = models["GREYC"]["accuracy"]
        browser_acc = models["Browser"]["accuracy"]
        
        diff = (greyc_acc - browser_acc) * 100
        
        print(f"\nGREYC Model:   {greyc_acc*100:.2f}%")
        print(f"Browser Model: {browser_acc*100:.2f}%")
        print(f"Difference:    {diff:.2f}%")
        
        if diff > 10:
            print("\n📊 GREYC model performs significantly better")
            print("   Reason: Much more training data (2200 vs {})".format(models["Browser"]["samples"]))
            print("   Recommendation: Continue collecting browser data")
        elif diff > 0:
            print("\n📊 GREYC model performs slightly better")
            print("   Reason: More training data (2200 vs {})".format(models["Browser"]["samples"]))
            print("   Recommendation: More data will close the gap")
        else:
            print("\n🎉 Browser model performs better than GREYC!")
            print("   Reason: No domain shift (browser → browser)")
            print("   Recommendation: Deploy browser model for production")

if __name__ == "__main__":
    compare_models()