# TypePrint

Keystroke biometric identification system — identifies users by their unique typing rhythm using a Random Forest classifier trained on the GREYC-NISLAB benchmark dataset.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS (port 5000)
- **Backend**: FastAPI + scikit-learn 1.3.2 + joblib (port 7860)
- **Model**: Pre-trained Random Forest on GREYC-NISLAB dataset, 86.1% top-1 accuracy, 110 users

## How to run

Two workflows must both be running:

| Workflow | Command | Port |
|---|---|---|
| **Backend API** | `cd backend && python app.py` | 7860 |
| **Start application** | `cd frontend && npm run dev` | 5000 |

The frontend Vite dev server proxies `/api/*` requests to the backend on port 7860.

## Key files

- `backend/app.py` — FastAPI entry point
- `backend/services/predictor.py` — model inference
- `backend/services/keystroke_processor.py` — feature extraction
- `backend/models/` — pre-trained `.pkl` model files (from Git LFS)
- `frontend/src/App.jsx` — React router and nav
- `frontend/src/services/api.js` — axios API client
- `frontend/vite.config.js` — Vite config with proxy to backend

## Notes

- **numpy must stay at 1.26.x** — the pre-trained model pickles were created with scikit-learn 1.3.0 / numpy 1.x. Upgrading numpy to 2.x breaks `ComplexWarning` imports and model loading.
- **Supabase is optional** — `SUPABASE_URL` and `SUPABASE_SECRET_KEY` env vars enable the data-collection endpoints (`/api/v1/store-keystroke`, `/api/v1/db-stats`). Without them the prediction endpoints work fine.
- The password the model was trained on is `united states of america` (P5 dataset).

## User preferences

_(none recorded yet)_
