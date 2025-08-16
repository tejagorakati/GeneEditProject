"use client";
import React, { useEffect, useRef, useState } from "react";

export default function NGLViewer() {
	const stageRef = useRef(null);
	const containerRef = useRef(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		let stage;
		async function init() {
			const NGL = (await import("ngl")).default;
			stage = new NGL.Stage(containerRef.current);
			stageRef.current = stage;
		}
		init();
		return () => {
			try { stage?.dispose(); } catch {}
		};
	}, []);

	async function loadSample() {
		if (!stageRef.current) return;
		await stageRef.current.loadFile("https://files.rcsb.org/download/1CRN.pdb");
		stageRef.current.autoView();
		setLoaded(true);
	}

	return (
		<div>
			<div ref={containerRef} className="w-full h-64 bg-gray-100 rounded" />
			<div className="mt-2 flex items-center gap-2">
				<button onClick={loadSample} className="px-3 py-2 rounded border text-sm">{loaded ? "Reload" : "Load Sample PDB"}</button>
			</div>
		</div>
	);
}