import requests
import json
import time
import random

BASE_URL = "http://127.0.0.1:8000"

def simulate_typing(text, speed_factor=1.0):
    """
    Simulate typing with realistic timing variations.
    
    Args:
        text: String to type
        speed_factor: Speed multiplier (1.0 = normal, 0.5 = fast, 1.5 = slow)
    
    Returns:
        List of keystroke events
    """
    events = []
    base_time = time.time() * 1000  # milliseconds
    
    for i, char in enumerate(text):
        # Variable timing with some randomness
        keydown_delay = random.uniform(80, 150) * speed_factor  # Time between keydown and keyup
        keyup_delay = random.uniform(40, 100) * speed_factor    # Time between keyup and next keydown
        
        # Keydown event
        events.append({
            "key": char,
            "type": "keydown",
            "timestamp": base_time,
            "charCode": ord(char)
        })
        
        # Keyup event (after holding the key)
        events.append({
            "key": char,
            "type": "keyup",
            "timestamp": base_time + keydown_delay,
            "charCode": ord(char)
        })
        
        # Next key starts after a short pause
        base_time += keydown_delay + keyup_delay
    
    return events

def test_endpoints():
    print("=== Testing TypePrint API ===\n")
    
    # Test health
    print("1. Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"✅ GET /health - Status: {response.status_code}")
    print(f"Response: {response.json()}\n")
    
    # Test root
    print("2. Testing root endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"✅ GET / - Status: {response.status_code}")
    print(f"Response: {response.json()}\n")
    
    # Test metadata
    print("3. Testing metadata endpoint...")
    response = requests.get(f"{BASE_URL}/metadata")
    print(f"✅ GET /metadata - Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    # Test prediction with features (old way)
    print("4. Testing feature-based prediction...")
    test_features = [0.0] * 92
    payload = {"features": test_features}
    response = requests.post(f"{BASE_URL}/api/v1/predict", json=payload)
    print(f"✅ POST /api/v1/predict - Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    # Test prediction with keystroke events
    print("5. Testing keystroke-based prediction...")
    text = "united states of america"
    print(f"   Typing: '{text}'")
    
    events = simulate_typing(text, speed_factor=1.0)
    print(f"   Generated {len(events)} events")
    
    payload = {"events": events}
    response = requests.post(f"{BASE_URL}/api/v1/predict-from-keystrokes", json=payload)
    print(f"✅ POST /api/v1/predict-from-keystrokes - Status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_endpoints()