import argparse
from pathlib import Path
import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("--model", default="models/xgb_kmer_v1.pkl")
	parser.add_argument("--data", default="data/train.csv")
	parser.add_argument("--outdir", default="explain")
	parser.add_argument("--k", type=int, default=5)
	args = parser.parse_args()

	model, vectorizer = joblib.load(args.model)
	df = pd.read_csv(args.data)
	sequences = df["sequence"].astype(str).tolist()

	def tokenize_kmers(sequence: str, k: int = 5) -> str:
		sequence = str(sequence).strip().upper()
		if len(sequence) < k:
			return sequence
		return " ".join(sequence[i : i + k] for i in range(len(sequence) - k + 1))

	X = vectorizer.transform([tokenize_kmers(s, k=args.k) for s in sequences])

	explainer = shap.TreeExplainer(model)
	shap_values = explainer.shap_values(X)

	Path(args.outdir).mkdir(parents=True, exist_ok=True)
	plt.figure(figsize=(10, 6))
	shap.summary_plot(shap_values, features=X, show=False)
	outfile = Path(args.outdir) / "summary_plot.png"
	plt.tight_layout()
	plt.savefig(outfile, dpi=200)
	print(f"Saved SHAP summary to {outfile}")


if __name__ == "__main__":
	main()