# TypePrint

Keystroke Biometric Identification System

TypePrint is an end-to-end keystroke biometric identification system that captures typing behavior in the browser, extracts timing-based features, and identifies users using machine learning. Built with React, FastAPI, and Scikit-learn on the GREYC-NISLAB benchmark dataset.

## Overview

This project demonstrates the complete machine learning workflow for biometric identification:
- Data exploration and preprocessing
- Feature extraction from keystroke timing patterns
- Model training and evaluation
- REST API deployment
- Interactive web interface for live typing capture

Users type a password, and the system identifies them based on their unique typing rhythm - the way they press and release keys, hold times between keystrokes, and other timing patterns.

## Features

- Real-time keystroke capture (keydown/keyup events)
- 92-dimensional feature extraction (PP, RR, PR, RP timing features)
- Random Forest classifier with 86.1% accuracy on benchmark dataset
- Top-5 predictions with confidence scores
- Interactive React frontend with real-time feedback
- FastAPI backend with proper error handling and logging
- Self-documenting API with Swagger UI

## Dataset

The model is trained on the GREYC-NISLAB Keystroke Benchmark Dataset, which contains:
- 110 users
- 20 typing samples per user
- 5 different passwords of varying lengths
- Feature vectors ranging from 64 to 92 dimensions

Password Comparison:
| Password | Features | Accuracy |
|----------|----------|----------|
| P5       | 92       | 86.1%    |
| P4       | 84       | 80.2%    |
| P2       | 68       | 76.1%    |
| P3       | 68       | 72.3%    |
| P1       | 64       | 71.4%    |

## Model Performance

The Random Forest classifier achieves the following results on the P5 dataset:
- Top-1 Accuracy: 86.1%
- Top-5 Accuracy: 97.0%
- Trained on 1,760 samples, tested on 440 samples
- 110 classes (users)

Model Comparison:
| Model | Accuracy |
|-------|----------|
| Random Forest | 86.1% |
| SVM (RBF) | 82.3% |
| K-Nearest Neighbors | 78.9% |
| Logistic Regression | 65.4% |
| XGBoost | 58.2% |

## Architecture

The system follows a clean separation of concerns:

```
User Types Password
        |
        v
Capture Keystroke Events (keydown/keyup)
        |
        v
Extract 92 Features (PP, RR, PR, RP)
        |
        v
FastAPI Backend
        |
        v
Random Forest Model
        |
        v
Display Prediction with Confidence
```

## Tech Stack

### Backend
- Python 3.10
- FastAPI (web framework)
- Scikit-learn (Random Forest)
- Pandas, NumPy (data processing)
- Joblib (model serialization)

### Frontend
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (API client)
- React Router (navigation)

## Installation

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python train.py  # Train the model
uvicorn app:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | API status |
| GET | /health | Health check |
| GET | /metadata | Model metadata |
| POST | /api/v1/predict | Predict from 92 features |
| POST | /api/v1/predict-from-keystrokes | Predict from raw keystroke events |

### Example Request (Keystroke Events)

```json
POST /api/v1/predict-from-keystrokes
{
  "events": [
    {"key": "u", "type": "keydown", "timestamp": 12345, "charCode": 117},
    {"key": "u", "type": "keyup", "timestamp": 12450, "charCode": 117}
  ]
}
```

### Example Response

```json
{
  "predicted_user": 45,
  "confidence": 0.89,
  "top5_predictions": [
    {"user_id": 45, "confidence": 0.89},
    {"user_id": 72, "confidence": 0.0467},
    {"user_id": 98, "confidence": 0.0133}
  ]
}
```

## Feature Extraction

The system extracts four types of timing features from keystroke events:

| Feature | Description | Formula |
|---------|-------------|---------|
| PP (Press-to-Press) | Time between consecutive keydowns | PP[i] = Press[i+1] - Press[i] |
| RR (Release-to-Release) | Time between consecutive keyups | RR[i] = Release[i+1] - Release[i] |
| PR (Press-to-Release) | Hold duration of each key | PR[i] = Release[i] - Press[i] |
| RP (Release-to-Press) | Time between keyup and next keydown | RP[i] = Press[i+1] - Release[i] |

## Key Findings

- Longer passwords significantly improve identification accuracy (P5: 86.1% vs P1: 71.4%)
- Random Forest outperformed XGBoost on this dataset (86.1% vs 58.2%)
- Browser-based inference introduces a domain shift from benchmark conditions
- Hold times (PR) are the most discriminative feature type

## Limitations

### Closed-Set Classification
The model identifies one of 110 benchmark participants. Unknown users are assigned to the closest learned identity.

### Domain Shift
Benchmark data was collected under controlled laboratory conditions with dedicated logging hardware. Browser-based keystroke capture introduces additional latency and variability.

### Feature Representation
The browser implementation approximates the benchmark feature representation. The original acquisition software and exact preprocessing pipeline are not publicly available.

## Future Work

- User enrollment system for new users
- Online learning to adapt to user typing changes
- Verification mode (1:1 matching) instead of identification (1:N)
- Continuous authentication during active typing sessions
- Deep learning approaches (LSTM, Transformers)
- Mobile application with touchscreen keystroke capture
- Multi-factor authentication (typing + face/voice)

## Project Structure

```
TypePrint/
├── backend/
│   ├── app.py                 # FastAPI entry point
│   ├── config.py              # Global configuration
│   ├── schemas.py             # Request/Response models
│   ├── train.py               # Model training script
│   ├── services/
│   │   ├── predictor.py       # Model inference
│   │   ├── preprocessing.py   # Input validation
│   │   └── keystroke_processor.py  # End-to-end processing
│   ├── utils/
│   │   └── logger.py          # Logging configuration
│   └── models/                # Serialized models
├── frontend/
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API client
│   │   └── hooks/             # Custom React hooks
│   └── public/                # Static assets
├── notebooks/                 # Jupyter notebooks for EDA
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- GREYC-NISLAB for providing the keystroke benchmark dataset
- Scikit-learn for the machine learning tools
- FastAPI and React communities for excellent documentation
