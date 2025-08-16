import argparse
from pathlib import Path
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.feature_extraction.text import CountVectorizer
import xgboost as xgb
from sklearn.metrics import roc_auc_score
import joblib


def tokenize_kmers(sequence: str, k: int = 5) -> str:
	sequence = str(sequence).strip().upper()
	if len(sequence) < k:
		return sequence
	return " ".join(sequence[i : i + k] for i in range(len(sequence) - k + 1))


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("--data", default="data/train.csv", help="CSV with columns sequence,label")
	parser.add_argument("--out", default="models/xgb_kmer_v1.pkl", help="Path to save model + vectorizer")
	parser.add_argument("--k", type=int, default=5)
	args = parser.parse_args()

	df = pd.read_csv(args.data)
	sequences = df["sequence"].astype(str).tolist()
	labels = df["label"].astype(int).values

	vectorizer = CountVectorizer(token_pattern=r"(?u)\\b\\w+\\b")
	X = vectorizer.fit_transform([tokenize_kmers(s, k=args.k) for s in sequences])

	kf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
	aucs = []
	for train_idx, val_idx in kf.split(X, labels):
		Xtr, Xv = X[train_idx], X[val_idx]
		ytr, yv = labels[train_idx], labels[val_idx]
		model = xgb.XGBClassifier(
			n_estimators=500,
			learning_rate=0.05,
			max_depth=6,
			reg_lambda=1.0,
			subsample=0.9,
			colsample_bytree=0.9,
			use_label_encoder=False,
			eval_metric="logloss",
			n_jobs=8,
		)
		model.fit(Xtr, ytr, early_stopping_rounds=30, eval_set=[(Xv, yv)], verbose=False)
		preds = model.predict_proba(Xv)[:, 1]
		auc = roc_auc_score(yv, preds)
		aucs.append(auc)

	print("CV AUCs:", [round(a, 4) for a in aucs])
	Path(args.out).parent.mkdir(parents=True, exist_ok=True)
	joblib.dump((model, vectorizer), args.out)
	print(f"Saved model+vectorizer to {args.out}")


if __name__ == "__main__":
	main()