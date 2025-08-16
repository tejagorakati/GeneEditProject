import io
import os
from fastapi.testclient import TestClient
from backend.app.main import app, process_job, UPLOAD_DIR, RESULTS_DIR

client = TestClient(app)


def test_health():
	resp = client.get("/health")
	assert resp.status_code == 200
	assert resp.json().get("status") == "ok"


def test_upload_endpoint():
	content = b">seq1\nATGCATGC\n"
	files = {"file": ("test.fa", content, "application/octet-stream")}
	resp = client.post("/upload", files=files)
	assert resp.status_code == 200
	data = resp.json()
	assert "job_id" in data
	assert data["status"] == "queued"
	# ensure file saved
	job_id = data["job_id"]
	expected = None
	for p in UPLOAD_DIR.glob(f"{job_id}_*"):
		expected = p
		break
	assert expected is not None and expected.exists()


def test_results_pending_and_ready():
	content = b">seq1\nATGCATGC\n"
	files = {"file": ("test2.fa", content, "application/octet-stream")}
	upload_resp = client.post("/upload", files=files)
	job_id = upload_resp.json()["job_id"]
	# Verify pending first
	pending_resp = client.get(f"/results/{job_id}")
	assert pending_resp.status_code == 202
	# Simulate background processing
	# reconstruct saved path
	saved_path = None
	for p in UPLOAD_DIR.glob(f"{job_id}_*"):
		saved_path = p
		break
	assert saved_path is not None
	process_job(job_id, str(saved_path))
	# Now results should be ready
	ready_resp = client.get(f"/results/{job_id}")
	assert ready_resp.status_code == 200
	data = ready_resp.json()
	assert data.get("job_id") == job_id
	assert "candidates" in data and isinstance(data["candidates"], list)