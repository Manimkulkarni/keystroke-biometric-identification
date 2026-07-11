"""
Test different depth limits while keeping 200 trees
"""
import pandas as pd
import joblib
import os
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "GREYC-NISLABKeystrokeBenchmarkDatasetSyed.xlsx"

def load_p5():
    df = pd.read_excel(DATA_PATH, sheet_name="P5")
    vectors = df["Keystroke Template Vector"].astype(str).apply(
        lambda x: [int(v) for v in x.split()]
    )
    X = pd.DataFrame(vectors.tolist())
    y = df["User_ID"]
    return X, y

def train_and_evaluate(n_estimators, max_depth):
    X, y = load_p5()
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    # Save to temp file to measure size
    temp_path = BASE_DIR / "models" / "temp_model.pkl"
    temp_path.parent.mkdir(exist_ok=True)
    joblib.dump(model, temp_path, compress=3)
    
    size_mb = temp_path.stat().st_size / 1024 / 1024
    temp_path.unlink()
    
    return acc, size_mb

def main():
    configs = [
        # n_estimators, max_depth
        (200, 30),
        (200, 40),
        (200, 50),
        (200, 60),
        (200, 80),
        (200, 100),
        (150, 30),
        (150, 40),
        (150, 50),
        (150, 60),
        (150, 80),
        (150, 100),
        (100, 30),
        (100, 40),
        (100, 50),
        (100, 60),
        (100, 80),
        (100, 100),
    ]
    
    print("=" * 60)
    print("DEPTH TESTING")
    print("=" * 60)
    print(f"{'Trees':<8} {'Depth':<8} {'Accuracy':<12} {'Size (MB)':<10}")
    print("-" * 60)
    
    results = []
    for n, depth in configs:
        acc, size = train_and_evaluate(n, depth)
        results.append((n, depth, acc, size))
        print(f"{n:<8} {depth:<8} {acc*100:.2f}%       {size:.2f}")
    
    # Find best accuracy under 50MB
    print("\n" + "=" * 60)
    print("BEST OPTIONS UNDER 50MB")
    print("=" * 60)
    
    viable = [r for r in results if r[3] < 50]
    if viable:
        best = max(viable, key=lambda x: x[2])
        print(f"Best: {best[0]} trees, depth={best[1]}")
        print(f"  Accuracy: {best[2]*100:.2f}%")
        print(f"  Size: {best[3]:.2f} MB")

if __name__ == "__main__":
    main()