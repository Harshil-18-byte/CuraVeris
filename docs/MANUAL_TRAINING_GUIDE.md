# CuraVeris - Complete Production Model Training Guide

Generated: 2026-08-27

---

## Current Model Status

| File | Size | Status |
|------|------|--------|
| curaveris_1b_real/model.pt | 583 MB | UNDERTRAINED (CPU, 3 steps, weight delta=0) |
| curaveris_4b_real/model.pt | 2.4 GB | UNDERTRAINED (loss rising, not converging) |
| xgboost_real.ubj | 338 KB | Undertrained |
| deep_mlp_real.pt | 54 KB | Undertrained |
| risk_classifier.pkl | 2.3 MB | Properly trained (OK) |
| hybrid_ensemble.joblib | 3.2 MB | Properly trained (OK) |

Problem: Last run used CPU mode, only 3 steps/epoch, loss ROSE from 4295 to 7390, weight delta=0.

---

## What Real Training Requires

| Parameter | Last Run (Bad) | Required |
|-----------|---------------|----------|
| Device | CPU | CUDA GPU |
| Batch size | 8 | 16-32 |
| Seq length | 64 | 512 |
| Scenarios | 500 | 2000+ |
| Steps/epoch | 3 | 133-1562 |
| Time | 22 min | 14-22 hours |

---

## OPTION A - RunPod (Recommended, ~$33 total)

### 1. Create Account
- Go to https://runpod.io and sign up
- Add credit card and at least $40 in credits

### 2. Deploy Pod
1. Deploy -> GPU Cloud
2. Search: NVIDIA A100 80GB SXM
3. Template: PyTorch 2.1.0 (Ubuntu 22.04)
4. Container Disk: 20 GB
5. Add Network Volume: 100 GB (mount: /workspace)
6. Click Deploy, wait 2 minutes
7. Click Connect -> note SSH details (IP and PORT)

### 3. Upload Code
From Git Bash on your Windows machine:

  rsync -avz --progress /j/Dev/PROJECTS/CuraVeris/ root@YOUR_IP:/workspace/CuraVeris/ -e "ssh -p YOUR_PORT" --exclude .git --exclude venv --exclude __pycache__

Or if on GitHub:
  git clone https://github.com/Harshil-18-byte/CuraVeris.git /workspace/CuraVeris

### 4. Install Dependencies (on RunPod terminal)

  cd /workspace/CuraVeris/backend
  python3 -m venv venv
  source venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
  pip install xgboost scikit-learn imbalanced-learn transformers datasets accelerate

  # Verify GPU:
  python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0))"
  # Expected: CUDA: True | GPU: NVIDIA A100-SXM4-80GB

### 5. Start tmux and Run Training

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

  # Detach tmux (safe to close SSH): Ctrl+B then D
  # Reattach later: tmux attach -t training

### 6. Monitor

  # Live logs (in new tmux window: Ctrl+B then C):
  tail -f /workspace/CuraVeris/backend/ml_training/logs/production_run_*.log

  # GPU usage (should be 90-100%):
  watch -n 2 nvidia-smi

GOOD log output (loss going DOWN):
  [1B] E1/3 S27/133  | Loss: 10.2341
  [1B] E1/3 S54/133  | Loss:  9.1421   <- DECREASING = good
  [1B] E2/3 S27/133  | Loss:  5.2341   <- DECREASING = good
  [1B] E3/3 S133/133 | Loss:  1.8234   <- Converged!
  [OK] CuraVeris-1B Weight Delta: 0.00231450  <- Non-zero = learned!

### 7. Download Trained Models (after ~14-22 hrs)
From Git Bash on Windows:

  rsync -avz --progress -e "ssh -p YOUR_PORT" root@YOUR_IP:/workspace/CuraVeris/backend/ml_training/models/ "/j/Dev/PROJECTS/CuraVeris/backend/ml_training/models/"

### 8. STOP THE POD!
RunPod dashboard -> Find pod -> Stop (NOT Terminate).
You only pay while it is running.

---

## OPTION B - Google Colab Pro+ (~$50/month)

### 1. Subscribe
- https://colab.research.google.com -> Tools -> Colab Pro+
- Runtime -> Change runtime type -> A100 GPU

### 2. Run These Cells

Cell 1 - Mount Drive:
  from google.colab import drive
  drive.mount('/content/drive')
  import os; os.makedirs('/content/drive/MyDrive/CuraVeris_Models', exist_ok=True)

Cell 2 - Clone Code:
  !git clone https://github.com/Harshil-18-byte/CuraVeris.git /content/CuraVeris

Cell 3 - Install deps:
  %cd /content/CuraVeris/backend
  !pip install -q -r requirements.txt
  !pip install -q xgboost imbalanced-learn transformers datasets accelerate

Cell 4 - Verify GPU:
  import torch
  print("CUDA:", torch.cuda.is_available())
  print("GPU:", torch.cuda.get_device_name(0))

Cell 5 - TRAINING:
  import subprocess
  cmd = ["python", "/content/CuraVeris/backend/ml_training/run_real_production_training.py",
         "--epochs", "3", "--batch-size", "16", "--seq-len", "512",
         "--num-scenarios", "2000", "--device", "cuda", "--precision", "bf16",
         "--checkpoint-every", "200", "--skip-layoutlm"]
  process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
  for line in process.stdout:
      print(line, end='')
  process.wait()

Cell 6 - Save to Drive:
  import shutil
  shutil.copytree('/content/CuraVeris/backend/ml_training/models',
                  '/content/drive/MyDrive/CuraVeris_Models', dirs_exist_ok=True)
  print("Saved to Drive!")

WARNING: Colab times out after ~12 hrs. Use --checkpoint-every 200 to save progress.
If it dies, use --resume-from flag (see Resume section below).

---

## OPTION C - Lambda Labs (~$22 total, no spot interruption risk)

1. Go to lambdalabs.com -> Launch Instance -> 1x A100 SXM4 (40 GB) -> $1.10/hr
2. Add your SSH key in Settings first
3. Connect: ssh ubuntu@YOUR_LAMBDA_IP
4. Then:

  git clone https://github.com/Harshil-18-byte/CuraVeris.git
  cd CuraVeris/backend
  pip install -r requirements.txt
  pip install xgboost imbalanced-learn accelerate

  tmux new -s train
  python ml_training/run_real_production_training.py \
      --epochs 3 --batch-size 16 --seq-len 512 \
      --num-scenarios 2000 --device cuda \
      --precision bf16 --checkpoint-every 200 --skip-layoutlm

---

## OPTION D - Local Machine CPU (testing only, not production)

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

Takes 4-8 hours. Models will not be production quality.

---

## Resuming If Training Was Interrupted

  # List checkpoints:
  ls backend/ml_training/models/checkpoints/

  # Resume (example: 1B done, 4B was interrupted at step 1200):
  python backend/ml_training/run_real_production_training.py \
      --resume-from backend/ml_training/models/checkpoints/stage7_4b_step_001200.pt \
      --skip-stages 1,2,3,4,5,6 \
      --epochs 3 --device cuda --precision bf16

Stage numbers:
  1=Risk Classifier  2=Deep MLP  3=LayoutLMv3
  4=Hybrid Ensemble  5=XGBoost   6=1B Model   7=4B Model   8=Validation

---

## Verifying Training Succeeded

PowerShell commands after downloading models:

  # Check file sizes
  Get-Item "j:\Dev\PROJECTS\CuraVeris\backend\ml_training\models\curaveris_1b_real\model.pt" | Select Length
  Get-Item "j:\Dev\PROJECTS\CuraVeris\backend\ml_training\models\curaveris_4b_real\model.pt" | Select Length

  # Test all 6 models load
  cd j:\Dev\PROJECTS\CuraVeris
  .\backend\venv\Scripts\Activate.ps1
  python -c "import sys; sys.path.insert(0,'backend'); from app.ml.unified_master_ensemble import UnifiedMasterAuditEnsemble; UnifiedMasterAuditEnsemble(); print('[OK] All 6 models loaded!')"

  # Check log for convergence
  Select-String -Path backend\ml_training\logs\production_run_*.log -Pattern "Weight Delta|ALL 6 MODELS"

PASS criteria:
  - Weight Delta > 0.001
  - Log says: ALL 6 MODELS UNIFIED AND CERTIFIED
  - Loss was decreasing across epochs

---

## Troubleshooting

CUDA out of memory:
  Add --batch-size 8 --seq-len 256
  Or add --skip-stages 7 to skip the 4B model

ModuleNotFoundError xgboost:
  pip install xgboost scikit-learn imbalanced-learn

ModuleNotFoundError transformers:
  pip install transformers datasets accelerate

Loss is NaN:
  Use --precision fp32 instead of bf16

SSH dropped / disconnected:
  Reconnect then: tmux attach -t training  (training keeps running in background)

Disk quota exceeded:
  find /workspace -name "__pycache__" -exec rm -rf {} +

---

## Quick Reference Commands

Full real GPU training:
  python backend/ml_training/run_real_production_training.py --epochs 3 --batch-size 16 --seq-len 512 --num-scenarios 2000 --device cuda --precision bf16 --checkpoint-every 200 --skip-layoutlm

Watch logs:
  tail -f backend/ml_training/logs/production_run_*.log

Watch GPU:
  watch -n 2 nvidia-smi

Verify ensemble:
  python -c "import sys; sys.path.insert(0,'backend'); from app.ml.unified_master_ensemble import UnifiedMasterAuditEnsemble; UnifiedMasterAuditEnsemble(); print('OK')"

Start backend after training:
  cd backend && python run.py

---

## Cost Summary

| Provider     | GPU         | VRAM | Cost/hr | Full Run   |
|--------------|-------------|------|---------|------------|
| RunPod       | A100 80GB   | 80GB | $1.64   | ~$33 BEST  |
| Lambda Labs  | A100 40GB   | 40GB | $1.10   | ~$22       |
| Vast.ai      | RTX 4090    | 24GB | $0.35   | ~$7 (1B)   |
| Colab Pro+   | A100 40GB   | 40GB | $50/mo  | Fixed      |

Recommended: RunPod A100 80GB SXM at ~$33 for the complete full run.
