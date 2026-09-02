"""ChromaDB Vector Store Client with BioBERT Embedding Function.
Manages three statutory benchmark collections:
1. cghs_collection: CGHS procedure rates (NABH & Non-NABH)
2. nppa_collection: NPPA medical device and implant ceiling prices
3. dpco_collection: DPCO essential medicine MRP price caps
"""

import os
import re
import math
import numpy as np
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.core.logging import logger
from app.db.reference_data import CGHS_SEEDS

try:
    import chromadb
    from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
except ImportError:
    class EmbeddingFunction:
        pass
    Documents = list
    Embeddings = list
    chromadb = None

CHROMA_PERSIST_DIR = getattr(settings, "CHROMA_PERSIST_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "chroma_db"))

# Reference SQLite DB paths (inside ml_training/data/reference/)
_ML_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "ml_training", "data", "reference")
NPPA_DB_PATH = os.path.join(_ML_DIR, "nppa.db")
DPCO_DB_PATH = os.path.join(_ML_DIR, "dpco.db")


def _load_nppa_from_db() -> list:
    """Load NPPA device ceilings + gazette drug MRPs from nppa.db.
    Returns unified list: (name, category, ceiling_price, order_reference).
    """
    import sqlite3
    if not os.path.exists(NPPA_DB_PATH):
        logger.warning(f"nppa.db not found at {NPPA_DB_PATH} — NPPA collection will be empty")
        return []
    conn = sqlite3.connect(NPPA_DB_PATH)
    cursor = conn.cursor()
    rows = []

    # Devices
    cursor.execute("SELECT device_name, category, ceiling_price, order_reference FROM nppa_devices")
    for r in cursor.fetchall():
        rows.append((r[0], r[1], r[2], r[3]))

    # Drugs (gazette MRP prices)
    cursor.execute("SELECT drug_name, category, mrp_per_unit, gazette_ref FROM nppa_drugs")
    for r in cursor.fetchall():
        rows.append((f"{r[0]}", r[1], r[2], r[3] or "NPPA_GAZETTE"))

    conn.close()
    return rows  # (name, category, price, reference)


def _load_dpco_from_db() -> list:
    """Load DPCO/NLEM drug MRP ceilings from dpco.db. Returns list of tuples."""
    import sqlite3
    if not os.path.exists(DPCO_DB_PATH):
        logger.warning(f"dpco.db not found at {DPCO_DB_PATH} — DPCO collection will be empty")
        return []
    conn = sqlite3.connect(DPCO_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT drug_name, formulation, mrp, scheduled, category FROM dpco_drugs")
    rows = cursor.fetchall()
    conn.close()
    return rows  # (drug_name, formulation, mrp, scheduled, category)


class BioBERTEmbeddingFunction(EmbeddingFunction):
    """Biomedical Embedding Function for ChromaDB.
    Produces 768-dimensional L2-normalized dense embeddings specialized for clinical terminology,
    procedures, surgical devices, and pharmacotherapy formulations.
    Supports HuggingFace/transformers if available, with a fast deterministic clinical subword
    vectorizer as fallback.
    """

    def name(self) -> str:
        return "biobert_embedding_function"

    def __init__(self, model_name: str = "dmis-lab/biobert-v1.1", dimension: int = 768):
        self.model_name = model_name
        self.dimension = dimension
        self._hf_pipeline = None

        # Attempt to load transformer pipeline if available
        try:
            from transformers import AutoTokenizer, AutoModel
            import torch
            hf_token = getattr(settings, "HF_TOKEN", "") or os.environ.get("HF_TOKEN") or None
            self._tokenizer = AutoTokenizer.from_pretrained(model_name, token=hf_token)
            self._model = AutoModel.from_pretrained(model_name, token=hf_token)
            self._torch = torch
            logger.info(f"Loaded HuggingFace BioBERT model: {model_name}")
        except Exception as e:
            logger.debug(f"HuggingFace BioBERT online load deferred ({e}), using fast clinical vectorizer")
            self._tokenizer = None
            self._model = None
            self._torch = None

    def __call__(self, input: List[str]) -> List[List[float]]:
        """ChromaDB EmbeddingFunction interface: takes documents and returns list of embeddings."""
        if not input:
            return []

        # If PyTorch and transformer model are active
        if self._tokenizer is not None and self._model is not None and self._torch is not None:
            try:
                embeddings = []
                for text in input:
                    inputs = self._tokenizer(text, return_tensors="pt", truncation=True, max_length=128, padding=True)
                    with self._torch.no_grad():
                        outputs = self._model(**inputs)
                        # Mean pooling over token embeddings
                        vec = outputs.last_hidden_state.mean(dim=1).squeeze().cpu().numpy()
                        norm = np.linalg.norm(vec)
                        if norm > 0:
                            vec = vec / norm
                        embeddings.append(vec.tolist())
                return embeddings
            except Exception as exc:
                logger.debug(f"BioBERT transformer inference fallback: {exc}")

        # High-performance clinical subword dense vectorizer (768 dimensions)
        return [self._embed_clinical_text(text) for text in input]

    def _embed_clinical_text(self, text: str) -> List[float]:
        """Deterministic, clinical term-weighted subword projection to 768-dim unit hypersphere."""
        import hashlib
        cleaned = re.sub(r"[^\w\s\.\-\+\/]", " ", text.lower()).strip()
        tokens = cleaned.split()

        vec = np.zeros(self.dimension, dtype=np.float32)
        if not tokens:
            vec[0] = 1.0
            return vec.tolist()

        # Clinical n-gram and character 3-gram feature projection
        for i, token in enumerate(tokens):
            weight = 1.8 if any(med_term in token for med_term in [
                "stent", "implant", "inj", "tab", "infusion", "surgery", "laparoscopic",
                "icu", "consultation", "test", "scan", "repair", "graft", "biopsy",
                "pantoprazole", "paracetamol", "cbc", "hemogram", "echo", "des", "tkr"
            ]) else 1.0

            # Deterministic token hash into vector bins
            token_int = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            bin_idx = token_int % self.dimension
            vec[bin_idx] += (2.0 * weight)

            # Character trigrams for morphological and dosage matching (e.g. 40mg, 1g)
            for j in range(len(token) - 2):
                tri = token[j:j+3]
                tri_int = int(hashlib.md5(tri.encode("utf-8")).hexdigest(), 16)
                vec[tri_int % self.dimension] += (0.4 * weight)

        # L2 Normalization to ensure cosine similarity matches Euclidean distance
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        else:
            vec[0] = 1.0

        return vec.tolist()


_chroma_client = None
_biobert_ef = None


def get_biobert_ef() -> BioBERTEmbeddingFunction:
    """Singleton getter for BioBERT embedding function."""
    global _biobert_ef
    if _biobert_ef is None:
        _biobert_ef = BioBERTEmbeddingFunction()
    return _biobert_ef


def get_chroma_client():
    """Singleton getter for ChromaDB persistent client."""
    global _chroma_client
    if _chroma_client is None:
        if chromadb is None:
            logger.warning("ChromaDB package is not installed; vector store operations will be mocked.")
            return None
        from chromadb.config import Settings as ChromaSettings

        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        logger.info(f"Connecting to ChromaDB at: {CHROMA_PERSIST_DIR}")
        _chroma_client = chromadb.PersistentClient(
            path=CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
    return _chroma_client


def init_chroma_collections():
    """Create and populate the 3 required collections:
    1. cghs_collection (procedure names, metadata: rate_non_nabh, rate_nabh, category)
    2. nppa_collection (device names, metadata: ceiling_price)
    3. dpco_collection (drug names+formulation, metadata: mrp)
    """
    client = get_chroma_client()
    if client is None:
        return {}

    ef = get_biobert_ef()

    # 1. CGHS Collection
    cghs_coll = client.get_or_create_collection(
        name="cghs_collection",
        embedding_function=ef,
        metadata={"hnsw:space": "cosine", "description": "CGHS official procedure benchmarks with BioBERT embeddings"}
    )
    if cghs_coll.count() == 0:
        logger.info("Populating ChromaDB 'cghs_collection'...")
        ids = [row[0] for row in CGHS_SEEDS]
        documents = [f"{row[1]} ({row[4]})" for row in CGHS_SEEDS]
        cghs_metadatas: Any = [
            {
                "procedure_code": row[0],
                "name": row[1],
                "rate_non_nabh": float(row[2]),
                "rate_nabh": float(row[3]),
                "category": row[4],
            }
            for row in CGHS_SEEDS
        ]
        cghs_coll.add(ids=ids, documents=documents, metadatas=cghs_metadatas)
        logger.info(f"Added {len(ids)} procedure benchmarks to 'cghs_collection'.")

    # 2. NPPA Collection (loaded from nppa.db)
    nppa_coll = client.get_or_create_collection(
        name="nppa_collection",
        embedding_function=ef,
        metadata={"hnsw:space": "cosine", "description": "NPPA medical device price ceilings"}
    )
    if nppa_coll.count() == 0:
        nppa_rows = _load_nppa_from_db()
        if nppa_rows:
            logger.info(f"Populating ChromaDB 'nppa_collection' with {len(nppa_rows)} items...")
            ids = [f"NPPA_{i+1:04d}" for i in range(len(nppa_rows))]
            documents = [f"{row[0]} ({row[1]})" for row in nppa_rows]
            nppa_metadatas: Any = [
                {
                    "name": str(row[0]),
                    "category": str(row[1]),
                    "ceiling_price": float(row[2]),
                    "reference": str(row[3]) if row[3] else "NPPA_GAZETTE",
                }
                for row in nppa_rows
            ]
            nppa_coll.add(ids=ids, documents=documents, metadatas=nppa_metadatas)
            logger.info(f"Added {len(ids)} NPPA items to 'nppa_collection'.")

    # 3. DPCO Collection (loaded from dpco.db)
    dpco_coll = client.get_or_create_collection(
        name="dpco_collection",
        embedding_function=ef,
        metadata={"hnsw:space": "cosine", "description": "DPCO/NLEM essential medicine price ceilings"}
    )
    if dpco_coll.count() == 0:
        dpco_rows = _load_dpco_from_db()
        if dpco_rows:
            logger.info(f"Populating ChromaDB 'dpco_collection' with {len(dpco_rows)} drugs...")
            ids = [f"DPCO_{i+1:04d}" for i in range(len(dpco_rows))]
            documents = [f"{row[0]} {row[1]}" for row in dpco_rows]
            dpco_metadatas: Any = [
                {
                    "drug_name": str(row[0]),
                    "formulation": str(row[1]),
                    "mrp": float(row[2]),
                    "scheduled": bool(row[3]),
                    "category": str(row[4]) if len(row) > 4 else "Essential Medicine",
                }
                for row in dpco_rows
            ]
            dpco_coll.add(ids=ids, documents=documents, metadatas=dpco_metadatas)
            logger.info(f"Added {len(ids)} drug MRP ceilings to 'dpco_collection'.")

    return {
        "cghs_collection": cghs_coll,
        "nppa_collection": nppa_coll,
        "dpco_collection": dpco_coll,
    }
