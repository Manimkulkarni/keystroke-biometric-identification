import joblib
import os

# Load the model
model = joblib.load("models/typeprint_p5_model.pkl")

# Save with MAXIMUM compression
joblib.dump(model, "models/typeprint_p5_model_lzma.pkl", compress=("lzma", 9))

# Check sizes
orig_size = os.path.getsize("models/typeprint_p5_model.pkl") / 1024 / 1024
new_size = os.path.getsize("models/typeprint_p5_model_lzma.pkl") / 1024 / 1024

print(f"Original: {orig_size:.2f} MB")
print(f"LZMA compressed: {new_size:.2f} MB")
print(f"Reduction: {(1 - new_size/orig_size)*100:.1f}%")