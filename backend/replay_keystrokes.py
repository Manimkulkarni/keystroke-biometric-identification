import pandas as pd
import numpy as np
import json
import requests
import time

def replay_dataset_sample(user_id=1):
    """
    Replay a sample from the dataset to test the frontend pipeline.
    """
    # Load dataset
    df = pd.read_excel("data/GREYC-NISLABKeystrokeBenchmarkDatasetSyed.xlsx", sheet_name="P5")
    
    # Find a sample for the specified user
    user_samples = df[df["User_ID"] == user_id]
    if len(user_samples) == 0:
        print(f"User {user_id} not found in dataset")
        return
    
    # Get the first sample
    sample = user_samples.iloc[0]
    vector = sample["Keystroke Template Vector"]
    values = [int(v) for v in vector.split()]
    
    print(f"=== Replaying User {user_id} ===")
    print(f"Feature vector length: {len(values)}")
    print(f"First 10 features: {values[:10]}")
    
    # Simulate keystroke events from the feature vector
    # This is complex because we need to reverse-engineer timestamps
    # For now, let's just send the features directly
    url = "http://localhost:8000/api/v1/predict"
    payload = {"features": values}
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    print(f"\nPrediction result:")
    print(f"Predicted user: {result['predicted_user']}")
    print(f"Confidence: {result['confidence']:.4f}")
    print(f"Top 5: {result['top5_predictions']}")

if __name__ == "__main__":
    # Test with User 1
    replay_dataset_sample(1)
    
    # Test with User 45
    replay_dataset_sample(45)