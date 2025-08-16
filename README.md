# Genomic Candidate Prediction — Starter

This workspace contains:

- Backend (`FastAPI`) with upload/results endpoints and background processing
- ML skeleton (`ml/train.py`, `ml/explain.py`) for k-mer + XGBoost and SHAP
- Tests (`backend/tests`) for core API flows

## Quickstart

Python dependencies (user-level install):

```
pip3 install --user -r backend/requirements.txt
```

Run backend locally:

```
python3 -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Run tests:

```
pytest -q
```

Folders:

- `backend/app`: FastAPI app
- `ml`: training and explainability scripts
- `uploads`, `results`, `models`: runtime artifacts (gitignored)
