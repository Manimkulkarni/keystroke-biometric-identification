# backend/test_model.py
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# Load data
df = pd.read_excel("data/GREYC-NISLABKeystrokeBenchmarkDatasetSyed.xlsx", sheet_name="P5")
vectors = df["Keystroke Template Vector"].astype(str).apply(
    lambda x: [int(v) for v in x.split()]
)
X = pd.DataFrame(vectors.tolist())
y = df["User_ID"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# Load optimized model
model = joblib.load("models/typeprint_p5_model.pkl")
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"Optimized model accuracy: {acc:.4f} ({acc*100:.2f}%)")

import os
size_mb = os.path.getsize("models/typeprint_p5_model.pkl") / 1024 / 1024
print(f"Model size: {size_mb:.2f} MB")