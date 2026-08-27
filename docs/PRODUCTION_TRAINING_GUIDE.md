---
{
  "id": "file_osix84y0",
  "filetype": "document",
  "filename": "PRODUCTION_TRAINING_GUIDE",
  "created_at": "2026-08-27T08:15:59.881Z",
  "updated_at": "2026-08-27T08:15:59.881Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# CuraVeris Production Training Guide

This document explains how to run the **real** hours-long production training that produces properly sized, properly trained models.

## The Two Scripts

| Script | What it does | Time |
| :--- | :--- | :--- |
| `run_full_production_training.py` | Quick verification run. Tiny models, synthetic steps. Proves the pipeline is wired correctly. | \~47 seconds |
| `run_real_production_training.py` | **Real training.** Full model sizes, full datasets, real epochs. Checkpoints saved. | **14-22 hours on A100** |

## Why the Quick Script Finishes in Seconds

The quick script uses:

- CuraVeris-1B hidden_size=**384**, layers=**4** (real: 768, 12)
- CuraVeris-4B hidden_size=**512**, layers=**4** (real: 1536, 16)
- Only **20 random steps** with batch=1, seq=64
- `time.sleep()` placeholders for XGBoost and MLP
- 10 bill scenarios

The real script uses actual model dimensions, a real DataLoader, real epochs, and a real optimizer loop that converges over thousands of steps.

## Hardware You Need

### Minimum (to run at all)

- 16 GB VRAM (RTX 3090 / RTX 4090 / A4000)
- Can run CuraVeris-1B in fp16. 4B will OOM — use `--skip-stages 7`.

### Recommended

- 40 GB VRAM (A100-40G)
- Runs both 1B and 4B in bf16. Full pipeline \~14 hours.

### Ideal

- 80 GB VRAM (A100-80G / H100)
- Full fp32 with larger batch sizes. LayoutLMv3 + 4B simultaneously.

## Cloud GPU Options (Cheapest to Most Powerful)

| Provider | GPU | VRAM | Cost/hr | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **RunPod** | RTX 3090 | 24 GB | \~$0.24 | Spot pricing |
| **RunPod** | A100 SXM | 80 GB | \~$1.64 | Best value for full run |
| **Lambda Labs** | A100-40G | 40 GB | \~$1.10 | Reliable, no spot risk |
| **Vast.ai** | RTX 4090 | 24 GB | \~$0.35 | Cheap for 1B only |
| **Google Colab Pro+** | A100 | 40 GB | \~$50/mo | Good for 1B, 4B is tight |
| **AWS p4d.24xlarge** | 8x A100 | 320 GB | \~$32/hr | Multi-GPU DDP |

**Recommended for CuraVeris**: RunPod A100 SXM 80GB (\~$1.64/hr x 20hr = ~$33 total)

## Step-by-Step: RunPod Setup

### 1. Rent the GPU

1. Go to https://runpod.io
2. Click **Deploy** → **GPU Cloud**
3. Select **NVIDIA A100 80GB SXM**
4. Choose a **PyTorch template** (pre-installed with CUDA)
5. Set storage: 50 GB network volume (to persist model weights)
6. Click **Deploy**

### 2. Upload Your Code

```bash
# Option A: Clone from GitHub (if repo is public/private with token)
git clone https://github.com/Harshil-18-byte/CuraVeris.git
cd CuraVeris

# Option B: rsync from your local machine
rsync -avz --progress \
    j:/Dev/PROJECTS/CuraVeris/ \
    user@YOUR_RUNPOD_IP:/workspace/CuraVeris/
```

### 3. Install Dependencies

```bash
cd /workspace/CuraVeris/backend

# Create venv
python3 -m venv venv
source venv/bin/activate

# Install all requirements
pip install --upgrade pip
pip install -r requirements.txt

# Install training extras (if not in requirements.txt)
pip install xgboost scikit-learn imbalanced-learn
pip install transformers datasets  # for LayoutLMv3
```

### 4. Run Real Production Training

```bash
cd /workspace/CuraVeris

# Full run - all 8 stages, 3 epochs, bf16, checkpoint every 200 steps
python backend/ml_training/run_real_production_training.py \
    --epochs 3 \
    --batch-size 16 \
    --seq-len 512 \
    --num-scenarios 2000 \
    --device cuda \
    --precision bf16 \
    --checkpoint-every 200 \
    --skip-layoutlm

# With LayoutLMv3 (need HuggingFace token):
export HF_TOKEN=hf_your_token_here
python backend/ml_training/run_real_production_training.py \
    --epochs 3 \
    --batch-size 16 \
    --seq-len 512 \
    --num-scenarios 2000 \
    --device cuda \
    --precision bf16 \
    --checkpoint-every 200
```

### 5. Run in Background (so SSH disconnect doesn't kill it)

```bash
# Using tmux (recommended)
tmux new -s training
python backend/ml_training/run_real_production_training.py --epochs 3 --device cuda --precision bf16

# Detach: Ctrl+B then D
# Reattach later: tmux attach -t training

# OR using nohup
nohup python backend/ml_training/run_real_production_training.py \
    --epochs 3 --device cuda --precision bf16 \
    > /workspace/CuraVeris/backend/ml_training/logs/nohup_out.log 2>&1 &

# Check progress
tail -f /workspace/CuraVeris/backend/ml_training/logs/production_run_*.log
```

### 6. Resume If Interrupted

```bash
# List available checkpoints
ls backend/ml_training/models/checkpoints/

# Resume from latest 4B checkpoint
python backend/ml_training/run_real_production_training.py \
    --resume-from backend/ml_training/models/checkpoints/stage7_4b_step_001200.pt \
    --skip-stages 1,2,3,4,5,6 \
    --epochs 3 --device cuda --precision bf16
```

### 7. Download Trained Models

```bash
# From your local machine, after training completes
rsync -avz --progress \
    user@YOUR_RUNPOD_IP:/workspace/CuraVeris/backend/ml_training/models/ \
    j:/Dev/PROJECTS/CuraVeris/backend/ml_training/models/
```

## What "Real" Model Sizes Look Like

### Quick Run vs Real Production

| Config | Quick (47s) | Real Production |
| :--- | :--- | :--- |
| CuraVeris-1B hidden_size | 384 | **768** |
| CuraVeris-1B layers | 4 | **12** |
| CuraVeris-1B parameters | \~31M | **\~200M** |
| CuraVeris-4B hidden_size | 512 | **1536** |
| CuraVeris-4B layers | 4 | **16** |
| CuraVeris-4B parameters | \~45M | **\~3-4B** |
| Batch size | 1 | **8-32** |
| Sequence length | 64 | **512-1024** |
| Training steps | 20 | **thousands** |
| Epochs | 2 | **3-10** |
| Bill scenarios | 10 | **2000-25000** |

## Monitoring Training

```bash
# Live log stream
tail -f backend/ml_training/logs/production_run_*.log

# GPU utilization
watch -n 2 nvidia-smi

# Disk usage
du -sh backend/ml_training/models/
```

## Expected Training Output (Real Run)

```
2026-08-26 10:00:00 | INFO | STAGE 6: REAL CURAVERIS-1B TRAINING
2026-08-26 10:00:01 | INFO |   Parameters: 200,310,784  (0.200B)
2026-08-26 10:00:01 | INFO |   Device: CUDA | Epochs: 3 | Seq: 512 | Batch: 16
2026-08-26 10:00:01 | INFO |   Records: 2,138 | Steps/Epoch: 133 | Total Steps: 399
2026-08-26 10:03:40 | INFO |   [1B] E1/3 S27/133 | Loss: 10.2341 | LR: 2.98e-04
2026-08-26 10:07:20 | INFO |   [1B] E1/3 S54/133 | Loss: 9.8741 | LR: 2.91e-04
2026-08-26 10:45:00 | INFO |   [OK] CuraVeris-1B Weight Delta: 0.00231450 (Confirmed)
```

Notice: loss is actually **decreasing** across steps (not fixed), weight delta is **much larger** than the quick run's 0.00002.

## Stage 3 - LayoutLMv3 (Special Setup)

LayoutLMv3 needs annotated bill images in FUNSD format. This is the most expensive stage to prepare data for.

### Minimal setup to enable it:

```bash
# 1. Get HuggingFace token (free at huggingface.co)
export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxx

# 2. Install vision deps
pip install transformers datasets Pillow

# 3. Remove --skip-layoutlm from your command
# 4. For a real annotated dataset, use Label Studio or Docling to annotate
#    your hospital bill images with bounding box labels.
```

## After Training Completes

```bash
# Verify all models saved
ls -la backend/ml_training/models/curaveris_1b_real/
ls -la backend/ml_training/models/curaveris_4b_real/
ls -la backend/ml_training/models/xgboost_real.ubj
ls -la backend/ml_training/models/deep_mlp_real.pt

# Run ensemble certification
python -c "from backend.app.ml.unified_master_ensemble import UnifiedMasterAuditEnsemble; e = UnifiedMasterAuditEnsemble(); print('All 6 models loaded OK')"

# Commit trained weights to git-lfs (if configured)
git lfs track "*.pt" "*.ubj"
git add backend/ml_training/models/
git commit -m "Add real production trained model weights"
git push origin main
```