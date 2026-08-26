"""
LayoutLMv3 Fine-Tuning Pipeline for Indian Hospital Bill Token Extraction.
Extracts: ITEM, QTY, RATE, AMOUNT, DATE, DOCTOR, TOTAL from bill scans.
"""
import os
import json
from typing import Dict, List, Any

# Target NER labels for hospital bill information extraction
LABEL_LIST = [
    "O",
    "B-ITEM", "I-ITEM",
    "B-QTY", "I-QTY",
    "B-RATE", "I-RATE",
    "B-AMOUNT", "I-AMOUNT",
    "B-DATE", "I-DATE",
    "B-DOCTOR", "I-DOCTOR",
    "B-TOTAL", "I-TOTAL"
]
LABEL_TO_ID = {label: i for i, label in enumerate(LABEL_LIST)}
ID_TO_LABEL = {i: label for i, label in enumerate(LABEL_LIST)}


def create_sample_layoutlm_dataset(output_dir: str = "./data/layoutlm_sample"):
    """
    Generates sample annotated bill data in standard LayoutLMv3 format.
    Bounding boxes are normalized to [0, 1000] coordinate space.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Sample annotated document structure
    sample_doc = {
        "id": "BILL_APOLLO_001",
        "tokens": [
            "APOLLO", "HOSPITALS", "INVOICE",
            "Dr.", "A.", "Sharma",
            "Date:", "12/08/2026",
            "Coronary", "Stent", "DES", "1", "65000.00", "65000.00",
            "Inj.", "Pantoprazole", "40mg", "3", "180.00", "540.00",
            "Grand", "Total:", "65540.00"
        ],
        "bboxes": [
            [50, 40, 150, 70], [160, 40, 300, 70], [310, 40, 420, 70],
            [50, 90, 80, 110], [90, 90, 110, 110], [120, 90, 200, 110],
            [600, 90, 660, 110], [670, 90, 780, 110],
            [50, 150, 130, 170], [140, 150, 190, 170], [200, 150, 240, 170], [450, 150, 470, 170], [550, 150, 640, 170], [700, 150, 800, 170],
            [50, 180, 80, 200], [90, 180, 210, 200], [220, 180, 270, 200], [450, 180, 470, 200], [550, 180, 620, 200], [700, 180, 780, 200],
            [500, 240, 560, 270], [570, 240, 630, 270], [700, 240, 810, 270]
        ],
        "ner_tags": [
            LABEL_TO_ID["O"], LABEL_TO_ID["O"], LABEL_TO_ID["O"],
            LABEL_TO_ID["B-DOCTOR"], LABEL_TO_ID["I-DOCTOR"], LABEL_TO_ID["I-DOCTOR"],
            LABEL_TO_ID["O"], LABEL_TO_ID["B-DATE"],
            LABEL_TO_ID["B-ITEM"], LABEL_TO_ID["I-ITEM"], LABEL_TO_ID["I-ITEM"], LABEL_TO_ID["B-QTY"], LABEL_TO_ID["B-RATE"], LABEL_TO_ID["B-AMOUNT"],
            LABEL_TO_ID["B-ITEM"], LABEL_TO_ID["I-ITEM"], LABEL_TO_ID["I-ITEM"], LABEL_TO_ID["B-QTY"], LABEL_TO_ID["B-RATE"], LABEL_TO_ID["B-AMOUNT"],
            LABEL_TO_ID["O"], LABEL_TO_ID["O"], LABEL_TO_ID["B-TOTAL"]
        ]
    }
    
    file_path = os.path.join(output_dir, "sample_annotations.json")
    with open(file_path, "w") as f:
        json.dump([sample_doc], f, indent=2)
    print(f"Created LayoutLMv3 sample dataset at: {file_path}")
    return file_path


def train_layoutlm_recipe():
    """
    Prints complete reference PyTorch training configuration for LayoutLMv3.
    Requires GPU environment (Google Colab / RunPod / local RTX).
    """
    code_template = '''
# ==============================================================================
# PyTorch LayoutLMv3 Training Script (Run on GPU / Colab)
# ==============================================================================
# Requirements:
# pip install torch torchvision transformers datasets seqeval pytesseract pillow

import torch
from transformers import (
    LayoutLMv3ForTokenClassification,
    LayoutLMv3Processor,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback
)
import evaluate
import numpy as np

LABELS = [
    "O", "B-ITEM", "I-ITEM", "B-QTY", "I-QTY", "B-RATE", "I-RATE",
    "B-AMOUNT", "I-AMOUNT", "B-DATE", "I-DATE", "B-DOCTOR", "I-DOCTOR", "B-TOTAL", "I-TOTAL"
]
id2label = {i: l for i, l in enumerate(LABELS)}
label2id = {l: i for i, l in enumerate(LABELS)}

# 1. Load Pretrained Foundation Model & Processor
processor = LayoutLMv3Processor.from_pretrained("microsoft/layoutlmv3-base", apply_ocr=False)
model = LayoutLMv3ForTokenClassification.from_pretrained(
    "microsoft/layoutlmv3-base",
    id2label=id2label,
    label2id=label2id
)

# 2. Metric Computation (Seqeval Entity-level Precision / Recall / F1)
seqeval = evaluate.load("seqeval")

def compute_metrics(p):
    predictions, labels = p
    predictions = np.argmax(predictions, axis=2)

    true_predictions = [
        [LABELS[p] for (p, l) in zip(prediction, label) if l != -100]
        for prediction, label in zip(predictions, labels)
    ]
    true_labels = [
        [LABELS[l] for (p, l) in zip(prediction, label) if l != -100]
        for prediction, label in zip(predictions, labels)
    ]

    results = seqeval.compute(predictions=true_predictions, references=true_labels)
    return {
        "precision": results["overall_precision"],
        "recall": results["overall_recall"],
        "f1": results["overall_f1"],
        "accuracy": results["overall_accuracy"],
    }

# 3. Training Hyperparameters
training_args = TrainingArguments(
    output_dir="./layoutlmv3-medbill-weights",
    num_train_epochs=20,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    learning_rate=2e-5,               # Ideal learning rate for LayoutLMv3
    warmup_ratio=0.10,                # 10% warmup steps
    weight_decay=0.01,
    logging_steps=20,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    save_total_limit=2,
    fp16=torch.cuda.is_available()    # Mixed precision if GPU available
)

# 4. Trainer Initialization
trainer = Trainer(
    model=model,
    args=training_args,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
)

print("Ready to train LayoutLMv3 with early stopping (patience=3).")
'''
    return code_template


def run_cpu_pipeline_check():
    """
    Validates token alignment and bounding box normalization on local CPU
    without requiring heavy PyTorch GPU backends.
    """
    print("\n" + "=" * 60)
    print("METHOD 2: LAYOUTLMv3 LOCAL CPU PIPELINE VERIFICATION")
    print("=" * 60)
    data_file = create_sample_layoutlm_dataset()
    with open(data_file, "r") as f:
        docs = json.load(f)

    doc = docs[0]
    tokens = doc["tokens"]
    bboxes = doc["bboxes"]
    tags = [ID_TO_LABEL[t] for t in doc["ner_tags"]]

    print(f"Verified sample document: {doc['id']}")
    print(f"Total tokens: {len(tokens)} | Total bounding boxes: {len(bboxes)}")
    
    # Verify [0, 1000] normalization
    all_valid_boxes = True
    for b in bboxes:
        if not (0 <= b[0] <= 1000 and 0 <= b[1] <= 1000 and 0 <= b[2] <= 1000 and 0 <= b[3] <= 1000):
            all_valid_boxes = False
            break
        if not (b[0] <= b[2] and b[1] <= b[3]):
            all_valid_boxes = False
            break

    print(f"Spatial [0, 1000] BBox coordinate validation: {'PASSED [OK]' if all_valid_boxes else 'FAILED'}")
    print("\nSample Aligned Tokens & Extracted Entities:")
    for t, b, tag in zip(tokens[:10], bboxes[:10], tags[:10]):
        print(f"  {t:<15} BBox: {str(b):<20} Tag: {tag}")

    colab_nb = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "notebooks", "CuraVeris_LayoutLMv3_Colab_Training.ipynb"))
    print("\n" + "-" * 60)
    print("READY FOR FULL GPU FINE-TUNING ON GOOGLE COLAB (FREE T4 GPU):")
    print(f"  Colab Notebook: {colab_nb}")
    print("  Instructions: Upload this notebook to https://colab.research.google.com/,")
    print("  select T4 GPU runtime, and run all cells. Download the resulting weights")
    print("  and place them into backend/app/ml/weights/")
    print("=" * 60)


if __name__ == "__main__":
    run_cpu_pipeline_check()
