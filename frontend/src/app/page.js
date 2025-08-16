"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const NGLViewer = dynamic(() => import("../components/NGLViewer"), { ssr: false });

export default function Home() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!file) return setError("Choose a FASTA/CSV file.");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(process.env.NEXT_PUBLIC_API_BASE + "/upload", { method: "POST", body: form });
      const j = await res.json();
      setJobId(j.job_id);
      pollResults(j.job_id);
    } catch (e) {
      setError("Upload failed. Check backend.");
      setLoading(false);
    }
  }

  async function runDemo() {
    // Create a tiny demo FASTA blob
    const content = ">demo\nATGCATGCATGCATGCATGC\n";
    const demo = new File([content], "demo.fa", { type: "text/plain" });
    setFile(demo);
  }

  function pollResults(id) {
    const poll = setInterval(async () => {
      try {
        const r = await fetch(process.env.NEXT_PUBLIC_API_BASE + `/results/${id}`);
        if (r.status === 202) return;
        const data = await r.json();
        if (data.candidates) {
          setResults(data);
          clearInterval(poll);
          setLoading(false);
        }
      } catch (e) {
        // swallow transient errors
      }
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-indigo-600" />
            <div>
              <div className="font-semibold">Genome Insight</div>
              <div className="text-xs text-gray-500">Model <span className="font-mono">xgb_kmer_v1</span></div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Safe demo • Read‑only visualization</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 px-6 py-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Input</h3>
            <p className="text-xs text-gray-500 mb-3">Upload FASTA/CSV. No edits performed.</p>
            <label className="block text-sm font-medium mb-1" htmlFor="file">Sequence file</label>
            <input id="file" aria-label="Upload sequence file" type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
            <div className="flex items-center gap-2 mt-3">
              <button onClick={submit} disabled={loading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">Run</button>
              <button onClick={runDemo} className="px-3 py-2 rounded-lg border text-sm">Run Demo</button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-sm text-red-600 mt-3">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-4 text-xs text-gray-500">Backend: {process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4 mt-6">
            <h4 className="font-semibold mb-2">Job</h4>
            <div className="text-xs text-gray-500">ID: <span className="font-mono">{jobId || "—"}</span></div>
            {loading && (
              <motion.div className="mt-3 h-1 w-full bg-gray-200 rounded" initial={{}} animate={{}}>
                <motion.div className="h-1 bg-indigo-600 rounded" initial={{ width: 0 }} animate={{ width: ["0%", "70%", "30%", "100%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
              </motion.div>
            )}
          </div>
        </aside>

        <main className="col-span-12 md:col-span-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Results</h2>
              <div className="text-xs text-gray-500">{results ? new Date().toLocaleString() : "Awaiting results"}</div>
            </div>

            {!results && (
              <div className="text-sm text-gray-500">No results yet — upload a FASTA/CSV or run demo.</div>
            )}

            <div className="space-y-3">
              {results?.candidates?.map((c, idx) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{c.region}</div>
                    <div className="text-indigo-600 font-semibold">{(c.score * 100).toFixed(1)}%</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{c.rationale}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4 mt-6">
            <h3 className="font-semibold mb-2">3D Protein Viewer</h3>
            <div className="text-xs text-gray-500 mb-2">Read‑only; loads a sample PDB when clicked.</div>
            <NGLViewer />
          </div>
        </main>

        <aside className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h4 className="font-semibold">Explainability</h4>
            <p className="text-xs text-gray-500">SHAP summary and feature contributions appear here after training.</p>
            <div className="mt-3 h-40 grid place-items-center text-sm text-gray-400">Coming soon</div>
            {results && (
              <div className="mt-4 text-xs text-gray-600">
                <div>Model version: <span className="font-mono">{results.model_version}</span></div>
                <div>Dataset hash: <span className="font-mono">demo_hash</span></div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
