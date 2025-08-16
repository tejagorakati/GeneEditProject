# Genomic Candidate Prediction — Starter

This workspace contains:

- Backend (`FastAPI`) with upload/results endpoints and background processing
- ML skeleton (`ml/train.py`, `ml/explain.py`) for k-mer + XGBoost and SHAP
- Frontend (`Next.js + Tailwind v3 + Framer Motion + NGL.js`) exceptional UI
- Tests (`backend/tests`) for core API flows

## Quickstart

Python dependencies (user-level install):

```
pip3 install --break-system-packages -r backend/requirements.txt
```

Run backend locally:

```
python3 -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Run tests:

```
PYTHONPATH=$PWD pytest -q
```

Frontend setup:

```
cd frontend
npm install --legacy-peer-deps
cp .env.local.example .env.local # or set NEXT_PUBLIC_API_BASE=http://localhost:8000
npm run dev
```

If building prod:

```
npm run build
```

Folders:

- `backend/app`: FastAPI app
- `ml`: training and explainability scripts (see `ml/requirements.txt`)
- `frontend`: Next.js app with Tailwind v3
- `uploads`, `results`, `models`: runtime artifacts (gitignored)
