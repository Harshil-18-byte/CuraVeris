---
{
  "id": "file_mcitudan",
  "filetype": "document",
  "filename": "MANUAL_TRAINING_GUIDE",
  "created_at": "2026-09-05T12:07:20.199Z",
  "updated_at": "2026-09-05T12:07:25.185Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# CuraVeris - Complete Production Model Training Guide

---

## Current Model Status

| File | Size | Status |
| :--- | :--- | :--- |
| `curaveris_1b_real/model.pt` | 583 MB | UNDERTRAINED (CPU, 3 steps, weight delta=0) |
| `curaveris_4b_real/model.pt` | 2.4 GB | UNDERTRAINED (loss rising, not converging) |
| `xgboost_real.ubj` | 338 KB | Undertrained |
| `deep_mlp_real.pt` | 54 KB | Undertrained |
| `risk_classifier.pkl` | 2.3 MB | Properly trained (OK) |
| `hybrid_ensemble.joblib` | 3.2 MB | Properly trained (OK) |

> \[!NOTE\] **Update — 2026 Production Certification**: The 6-model pipeline was unified and certified via `run_real_production_training.py` with 3,293 master bills, training XGBoost, Deep MLP, ChromaDB BioBERT index, and calibrator gates.

---

## What Real Training Requires

| Parameter | Previous Run (CPU) | Required Production Run |
| :--- | :--- | :--- |
| **Device** | CPU | CUDA GPU (A100 / RTX 4090) |
| **Batch Size** | 8 | 16-32 |
| **Sequence Length** | 64 | 512 |
| **Scenarios** | 500 | 2000+ |
| **Steps / Epoch** | 3 | 133-1562 |
| **Training Time** | 22 min | 14-22 hours |

---

## OPTION A - RunPod (Recommended, \~$33 total)

### 1. Create Account

- Go to [RunPod](https://runpod.io) and sign up.
- Add credit card and at least $40 in credits.

### 2. Deploy Pod

1. Navigate to **Deploy** -&gt; **GPU Cloud**.
2. Select: **NVIDIA A100 80GB SXM**.
3. Template: **PyTorch 2.1.0 (Ubuntu 22.04)**.
4. Container Disk: **20 GB**.
5. Network Volume: **100 GB** (mount: `/workspace`).
6. Click **Deploy** and wait \~2 minutes.
7. Click **Connect** -&gt; note SSH details (IP and Port).

### 3. Upload Code

From Git Bash or terminal on your machine:

```bash
rsync -avz --progress /j/Dev/PROJECTS/CuraVeris/ root@YOUR_IP:/workspace/CuraVeris/ -e "ssh -p YOUR_PORT" --exclude .git --exclude venv --exclude __pycache__
```

Or clone directly via Git on the pod:

```bash
git clone https://github.com/Harshil-18-byte/CuraVeris.git /workspace/CuraVeris
```

### 4. Install Dependencies (RunPod Terminal)

```bash
cd /workspace/CuraVeris/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install xgboost scikit-learn imbalanced-learn transformers datasets accelerate
```

Verify GPU availability:

```bash
python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0))"
# Expected: CUDA: True | GPU: NVIDIA A100-SXM4-80GB
```

### 5. Start tmux and Run Training

```bash
cd /workspace/CuraVeris
tmux new -s training
source backend/venv/bin/activate

python backend/ml_training/run_real_production_training.py \
    --epochs 3 \
    --batch-size 16 \
    --seq-len 512 \
    --num-scenarios 2000 \
    --device cuda \
    --precision bf16 \
    --checkpoint-every 200 \
    --skip-layoutlm
```

> \[!TIP\] Detach tmux safely with `Ctrl+B` then `D`. Reattach anytime with `tmux attach -t training`.

### 6. Monitor Logs & GPU

```bash
# Live training logs
tail -f /workspace/CuraVeris/backend/ml_training/logs/production_run_*.log

# GPU utilization (should be 90-100%)
watch -n 2 nvidia-smi
```

### 7. Download Trained Models

From your local terminal:

```bash
rsync -avz --progress -e "ssh -p YOUR_PORT" root@YOUR_IP:/workspace/CuraVeris/backend/ml_training/models/ "/j/Dev/PROJECTS/CuraVeris/backend/ml_training/models/"
```

### 8. Stop the Pod

RunPod dashboard -&gt; Find pod -&gt; **Stop** (do not leave it running when training completes).

---

## OPTION B - Google Colab Pro+ (\~$50/month)

### 1. Subscribe & Select GPU

- Go to [Google Colab](https://colab.research.google.com) -&gt; **Tools** -&gt; **Colab Pro+**.
- Select: **Runtime** -&gt; **Change runtime type** -&gt; **A100 GPU**.

### 2. Run These Cells

#### Cell 1 - Mount Drive

```python
from google.colab import drive
import os

drive.mount('/content/drive')
os.makedirs('/content/drive/MyDrive/CuraVeris_Models', exist_ok=True)
```

#### Cell 2 - Clone Code

```bash
!git clone https://github.com/Harshil-18-byte/CuraVeris.git /content/CuraVeris
```

#### Cell 3 - Install Dependencies

```bash
%cd /content/CuraVeris/backend
!pip install -q -r requirements.txt
!pip install -q xgboost imbalanced-learn transformers datasets accelerate
```

#### Cell 4 - Verify GPU

```python
import torch

print("CUDA:", torch.cuda.is_available())
print("GPU:", torch.cuda.get_device_name(0))
```

#### Cell 5 - Run Training Pipeline

```python
import subprocess

cmd = [
    "python", "/content/CuraVeris/backend/ml_training/run_real_production_training.py",
    "--epochs", "3",
    "--batch-size", "16",
    "--seq-len", "512",
    "--num-scenarios", "2000",
    "--device", "cuda",
    "--precision", "bf16",
    "--checkpoint-every", "200",
    "--skip-layoutlm"
]
process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
for line in process.stdout:
    print(line, end='')
process.wait()
```

#### Cell 6 - Save Model Artifacts to Drive

```python
import shutil

shutil.copytree('/content/CuraVeris/backend/ml_training/models',
                '/content/drive/MyDrive/CuraVeris_Models', dirs_exist_ok=True)
print("Saved to Drive!")
```

> \[!WARNING\] Colab sessions timeout after \~12 hours. Use `--checkpoint-every 200` to ensure progress is saved. If disconnected, resume via `--resume-from` checkpoint.

---

## OPTION C - Lambda Labs (\~$22 total, no spot interruption risk)

1. Go to [Lambda Labs](https://lambdalabs.com) -&gt; Launch Instance -&gt; **1x A100 SXM4 (40 GB)** -&gt; $1.10/hr.
2. Add SSH public key in Settings.
3. Connect: `ssh ubuntu@YOUR_LAMBDA_IP`.
4. Run setup and training:

```bash
git clone https://github.com/Harshil-18-byte/CuraVeris.git
cd CuraVeris/backend
pip install -r requirements.txt
pip install xgboost imbalanced-learn accelerate

tmux new -s train
python ml_training/run_real_production_training.py \
    --epochs 3 \
    --batch-size 16 \
    --seq-len 512 \
    --num-scenarios 2000 \
    --device cuda \
    --precision bf16 \
    --checkpoint-every 200 \
    --skip-layoutlm
```

---

## OPTION D - Local Machine CPU (Testing Only)

```powershell
cd j:\Dev\PROJECTS\CuraVeris
.\backend\venv\Scripts\Activate.ps1

python backend\ml_training\run_real_production_training.py `
    --epochs 1 `
    --batch-size 2 `
    --seq-len 128 `
    --num-scenarios 200 `
    --device cpu `
    --precision fp32 `
    --checkpoint-every 50 `
    --skip-layoutlm
```

> \[!NOTE\] CPU runs take 4-8 hours and are intended only for integration and sanity testing.

---

## Resuming If Training Was Interrupted

```bash
# List available checkpoints
ls backend/ml_training/models/checkpoints/

# Resume training from checkpoint (e.g. step 1200)
python backend/ml_training/run_real_production_training.py \
    --resume-from backend/ml_training/models/checkpoints/stage7_4b_step_001200.pt \
    --skip-stages 1,2,3,4,5,6 \
    --epochs 3 \
    --device cuda \
    --precision bf16
```

### Pipeline Stage Numbering

- **Stage 1**: Risk Classifier (XGBoost)
- **Stage 2**: Deep MLP Neural Network
- **Stage 3**: LayoutLMv3 Visual Extractor
- **Stage 4**: Hybrid Stacking Ensemble
- **Stage 5**: XGBoost Real UBJ
- **Stage 6**: CuraVeris-1B Model
- **Stage 7**: CuraVeris-4B Model
- **Stage 8**: Validation & Certification

---

## Verifying Training Succeeded

PowerShell commands after downloading model artifacts:

```powershell
# Check file sizes
Get-Item "j:\Dev\PROJECTS\CuraVeris\backend\ml_training\models\curaveris_1b_real\model.pt" | Select Length
Get-Item "j:\Dev\PROJECTS\CuraVeris\backend\ml_training\models\curaveris_4b_real\model.pt" | Select Length

# Test unified ensemble loading
cd j:\Dev\PROJECTS\CuraVeris
.\backend\venv\Scripts\Activate.ps1
python -c "import sys; sys.path.insert(0,'backend'); from app.ml.unified_master_ensemble import UnifiedMasterAuditEnsemble; UnifiedMasterAuditEnsemble(); print('[OK] All 6 models loaded!')"

# Check log for convergence
Select-String -Path backend\ml_training\logs\production_run_*.log -Pattern "Weight Delta|ALL 6 MODELS"
```

### PASS Criteria

- **Weight Delta**: $> 0.001$ across all layers.
- **Certification**: Log contains `ALL 6 MODELS UNIFIED AND CERTIFIED`.
- **Loss Curve**: Monotonically decreasing loss across epochs.

---

## Troubleshooting

### CUDA Out of Memory (OOM)

```bash
# Reduce batch size and sequence length
python backend/ml_training/run_real_production_training.py --batch-size 8 --seq-len 256
# Or skip the 4B foundation model
python backend/ml_training/run_real_production_training.py --skip-stages 7
```

### Missing Dependencies

```bash
pip install xgboost scikit-learn imbalanced-learn transformers datasets accelerate
```

### Loss is NaN

```bash
# Use fp32 precision instead of bf16
python backend/ml_training/run_real_production_training.py --precision fp32
```

### SSH Connection Dropped

```bash
# Reconnect to the instance and reattach the active tmux session
tmux attach -t training
```

---

## Cost Summary

| Provider | GPU | VRAM | Hourly Cost | Estimated Total | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RunPod** | A100 80GB SXM | 80 GB | $1.64 / hr | \~$33 | **Best Choice** |
| **Lambda Labs** | A100 40GB SXM4 | 40 GB | $1.10 / hr | \~$22 | Solid Alternative |
| **Vast.ai** | RTX 4090 | 24 GB | $0.35 / hr | \~$7 (1B only) | Budget Option |
| **Google Colab Pro+** | A100 40GB | 40 GB | $50 / mo | Flat | Interactive |
