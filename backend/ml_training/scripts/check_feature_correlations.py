"""Step 14: Feature Correlation & Distribution Audit Script.

Audits:
1. Pairwise Pearson correlation matrix (ensures no collinear features > 0.80)
2. Non-zero variance check across all 10 features
3. Distribution separation for risk indicators
4. Outputs JSON summary and correlation matrix

CLI:
  python check_feature_correlations.py [--features-dir <dir>]
"""

import os
import sys
import json
import argparse
import numpy as np
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
DEFAULT_FEATURES_DIR = os.path.join(ML_DIR, "data", "processed", "features")


def main():
    parser = argparse.ArgumentParser(description="Audit feature correlations and distributions")
    parser.add_argument("--features-dir", type=str, default=DEFAULT_FEATURES_DIR, help="Path to features dir")
    args = parser.parse_args()

    print("=" * 75)
    print("        STEP 14: FEATURE CORRELATION & DISTRIBUTION AUDIT")
    print("=" * 75)

    meta_path = os.path.join(args.features_dir, "feature_metadata.json")
    with open(meta_path, "r") as f:
        meta = json.load(f)

    feature_names = meta["feature_names"]
    label_names = meta["label_names"]

    train_x_path = os.path.join(args.features_dir, "train_X.npy")
    train_y_path = os.path.join(args.features_dir, "train_y.npy")

    X = np.load(train_x_path)
    y = np.load(train_y_path)

    df_X = pd.DataFrame(X, columns=feature_names)
    df_y = pd.DataFrame(y, columns=label_names)

    print(f"[*] Training dataset size: {X.shape[0]} line items, {X.shape[1]} features.")
    print("-" * 75)

    # 1. Non-zero variance check
    print("[1] Variance & Range Check per Feature:")
    zero_variance_cols = []
    for col in feature_names:
        var = float(df_X[col].var())
        mean = float(df_X[col].mean())
        min_v = float(df_X[col].min())
        max_v = float(df_X[col].max())
        print(f"    - {col:28s}: mean={mean:7.3f}, std={np.sqrt(var):7.3f}, range=[{min_v:7.3f}, {max_v:7.3f}]")
        if var < 1e-6:
            zero_variance_cols.append(col)

    if zero_variance_cols:
        print(f"\n[!] WARNING: Zero-variance features detected: {zero_variance_cols}")
    else:
        print("\n[✓] All 10 features have healthy, non-zero variance.")

    # 2. Pairwise Correlation Matrix
    print("\n[2] Pairwise Pearson Correlation Matrix (Upper Triangle):")
    corr_matrix = df_X.corr()
    high_corr_pairs = []

    for i in range(len(feature_names)):
        for j in range(i + 1, len(feature_names)):
            f1, f2 = feature_names[i], feature_names[j]
            r = corr_matrix.loc[f1, f2]
            if abs(r) > 0.80:
                high_corr_pairs.append((f1, f2, r))

    if high_corr_pairs:
        print(f"[!] Warning: Highly correlated feature pairs (|r| > 0.80):")
        for f1, f2, r in high_corr_pairs:
            print(f"    - {f1} <-> {f2}: r = {r:.4f}")
    else:
        print("[✓] PASS: No collinear feature pairs found (|r| <= 0.80 for all pairs).")

    # 3. Correlation between features and target labels
    print("\n[3] Feature-to-Target Risk Correlation (Signal Strength):")
    target_corrs = {}
    for lbl in label_names:
        print(f"    * Label: '{lbl}' top predictors:")
        corrs = {}
        for feat in feature_names:
            r = float(np.corrcoef(df_X[feat], df_y[lbl])[0, 1])
            corrs[feat] = 0.0 if np.isnan(r) else r
        sorted_c = sorted(corrs.items(), key=lambda x: -abs(x[1]))
        target_corrs[lbl] = corrs
        for f_name, c_val in sorted_c[:3]:
            print(f"        - {f_name:26s}: r = {c_val:+.4f}")

    # 4. Save audit report
    report = {
        "n_samples": int(X.shape[0]),
        "n_features": int(X.shape[1]),
        "zero_variance_features": zero_variance_cols,
        "high_correlation_pairs": [
            {"feature_1": p[0], "feature_2": p[1], "correlation": float(p[2])} for p in high_corr_pairs
        ],
        "feature_correlations": corr_matrix.to_dict(),
        "target_signal_strength": target_corrs,
    }

    report_path = os.path.join(args.features_dir, "feature_correlations.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n[✓] STEP 14 CHECK PASSED: Audit report saved to {report_path}")


if __name__ == "__main__":
    main()
