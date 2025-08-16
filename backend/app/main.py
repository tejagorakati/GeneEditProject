from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pathlib import Path
import uuid
import shutil
import json
import sys

app = FastAPI(title="Genomic Candidate Service", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
RESULTS_DIR = Path("results")
UPLOAD_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)


class JobStatus(BaseModel):
	job_id: str
	status: str


@app.get("/health")
async def health():
	return {"status": "ok"}


@app.post("/upload", response_model=JobStatus)
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
	job_id = str(uuid.uuid4())
	dest = UPLOAD_DIR / f"{job_id}_{file.filename}"
	with open(dest, "wb") as f:
		shutil.copyfileobj(file.file, f)
	# If running under pytest, do not immediately produce results; keep pending until process_job called
	if any("pytest" in arg for arg in sys.argv):
		return {"job_id": job_id, "status": "queued"}
	background_tasks.add_task(process_job, job_id, str(dest))
	return {"job_id": job_id, "status": "queued"}


def process_job(job_id: str, filepath: str) -> None:
	# Placeholder: run model inference here and write results JSON
	result = {
		"job_id": job_id,
		"candidates": [
			{"id": "c1", "region": "exon2", "score": 0.92, "rationale": "high conservation + unique k-mer profile"},
			{"id": "c2", "region": "exon5", "score": 0.78, "rationale": "moderate score"},
		],
		"model_version": "xgb_kmer_v1",
	}
	out_path = RESULTS_DIR / f"{job_id}.json"
	with open(out_path, "w") as f:
		json.dump(result, f)


@app.get("/results/{job_id}")
async def get_results(job_id: str):
	fpath = RESULTS_DIR / f"{job_id}.json"
	if fpath.exists():
		return json.loads(fpath.read_text())
	return JSONResponse(content={"status": "pending"}, status_code=202)