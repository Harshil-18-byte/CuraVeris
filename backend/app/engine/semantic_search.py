import re
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.db.reference_data import CGHS_SEEDS, NPPA_SEEDS, DPCO_SEEDS, IRDAI_NON_PAYABLES
from app.core.logging import logger

# Colloquial Indian clinical synonyms dictionary
COLLOQUIAL_SYNONYMS: Dict[str, str] = {
    "stomach camera test": "Upper GI Endoscopy Diagnostic Gastro",
    "stomach endoscopy": "Upper GI Endoscopy Diagnostic Gastro",
    "food pipe camera": "Upper GI Endoscopy Diagnostic Gastro",
    "heart spring stent": "Coronary Stent Drug Eluting DES Cardiac",
    "heart wire stent": "Coronary Stent Drug Eluting DES Cardiac",
    "angioplasty stent": "Coronary Stent Drug Eluting DES Cardiac",
    "knee cap replacement": "Knee Implant System Primary TKR Orthopedic",
    "knee replacement surgery": "Total Knee Replacement TKR Unilateral",
    "hip ball replacement": "Total Hip Replacement THR Unilateral",
    "sugar pill 500": "Metformin Hydrochloride 500mg Diabetes DPCO",
    "sugar tablets": "Metformin Hydrochloride 500mg Diabetes DPCO",
    "daily sugar prick test": "Blood Sugar Fasting Post Prandial Glucose",
    "blood sugar test": "Blood Sugar Fasting Post Prandial Glucose",
    "heart bypass surgery": "Coronary Artery Bypass Graft CABG Heart",
    "open heart surgery": "Coronary Artery Bypass Graft CABG Heart",
    "appendix removal": "Appendectomy Laparoscopic Surgery",
    "appendix operation": "Appendectomy Laparoscopic Surgery",
    "gallbladder stone surgery": "Cholecystectomy Laparoscopic Gallbladder",
    "gallbladder removal": "Cholecystectomy Laparoscopic Gallbladder",
    "normal delivery baby": "Normal Vaginal Delivery Maternity Childbirth",
    "cesarean operation": "Cesarean Delivery LSCS Maternity Childbirth",
    "kidney washing": "Hemodialysis Nephrology Kidney Renal",
    "dialysis session": "Hemodialysis Nephrology Kidney Renal",
    "eye cataract lens": "Cataract Surgery Phaco Foldable IOL Eye",
    "prostate urine operation": "Transurethral Resection Prostate TURP Urology",
    "brain scan": "CT Scan Head Brain Plain Radiology",
    "spine mri": "MRI Spine Single Region Radiology",
    "liver test": "Liver Function Test LFT Diagnostic",
    "kidney test": "Kidney Function Test KFT RFT Diagnostic",
    "cholesterol test": "Lipid Profile Diagnostic Cholesterol",
    "complete blood test": "Complete Blood Count CBC Hemogram Pathology"
}


class SemanticVectorSearchEngine:
    """
    High-performance in-memory semantic vector search engine for Indian clinical procedures,
    medical devices (NPPA), scheduled essential medicines (DPCO), and IRDAI consumables.
    """

    def __init__(self):
        self.corpus: List[str] = []
        self.metadata: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.vector_matrix = None
        self._is_indexed = False
        self._build_index()

    def _normalize_text(self, text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _build_index(self):
        """Indexes all statutory benchmarks into a high-dimensional vector space."""
        self.corpus = []
        self.metadata = []

        # 1. Index CGHS procedures
        for code, name, non_nabh, nabh, category in CGHS_SEEDS:
            clean = self._normalize_text(f"{code} {name} {category}")
            self.corpus.append(clean)
            self.metadata.append({
                "id": code,
                "name": name,
                "type": "cghs_procedure",
                "category": category,
                "benchmark_rate_non_nabh": non_nabh,
                "benchmark_rate_nabh": nabh,
                "statutory_authority": "CGHS Directorate General of Health Services"
            })

        # 2. Index NPPA Medical Devices
        for device_name, category, ceiling_price, order_ref in NPPA_SEEDS:
            clean = self._normalize_text(f"{device_name} {category} stent implant device")
            self.corpus.append(clean)
            self.metadata.append({
                "id": f"NPPA_{category}",
                "name": device_name,
                "type": "nppa_device",
                "category": category,
                "ceiling_price_inr": ceiling_price,
                "statutory_authority": order_ref
            })

        # 3. Index DPCO Scheduled Medicines
        for drug_name, dosage, ceiling_price, is_nlem in DPCO_SEEDS:
            clean = self._normalize_text(f"{drug_name} {dosage} medicine drug tablet injection")
            self.corpus.append(clean)
            self.metadata.append({
                "id": f"DPCO_{self._normalize_text(drug_name)[:10]}",
                "name": f"{drug_name} ({dosage})",
                "type": "dpco_drug",
                "category": "essential_medicine",
                "ceiling_price_inr": ceiling_price,
                "is_nlem": bool(is_nlem),
                "statutory_authority": "DPCO 2013 National List of Essential Medicines"
            })

        # 4. Index IRDAI Non-Payable Consumables
        for item in IRDAI_NON_PAYABLES:
            clean = self._normalize_text(f"{item} consumable non payable unbundled")
            self.corpus.append(clean)
            self.metadata.append({
                "id": f"IRDAI_{self._normalize_text(item)[:10]}",
                "name": item,
                "type": "irdai_consumable",
                "category": "unbundled_consumable",
                "ceiling_price_inr": 0.0,
                "statutory_authority": "IRDAI Master Circular 2024 Non-Payables Schedule"
            })

        # Build TF-IDF n-gram vectorizer
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            sublinear_tf=True,
            token_pattern=r"(?u)\b[a-zA-Z0-9]{2,}\b"
        )
        self.vector_matrix = self.vectorizer.fit_transform(self.corpus)
        self._is_indexed = True
        logger.info(f"Semantic Vector Search Engine indexed {len(self.corpus)} statutory medical items.")

    def search_procedure(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Executes semantic vector search against statutory benchmarks.
        Expands colloquial synonyms and computes cosine similarity ranking.
        """
        if not self._is_indexed:
            self._build_index()

        norm_query = self._normalize_text(query)
        if not norm_query:
            return []

        # Check colloquial synonym expansions
        for colloquy, formal in COLLOQUIAL_SYNONYMS.items():
            if colloquy in norm_query:
                norm_query += " " + self._normalize_text(formal)
                break

        # Transform query into vector space
        query_vec = self.vectorizer.transform([norm_query])
        similarities = cosine_similarity(query_vec, self.vector_matrix)[0]

        top_indices = np.argsort(similarities)[::-1][:top_k]
        results = []

        for idx in top_indices:
            score = float(similarities[idx])
            if score < 0.10:
                continue
            item = dict(self.metadata[idx])
            item["similarity_score"] = round(score, 4)
            item["confidence_percentage"] = round(min(score * 100 * 1.35, 99.5), 1)
            results.append(item)

        return results

    def best_procedural_match(self, item_name: str, threshold: float = 0.30) -> Optional[Dict[str, Any]]:
        """Finds the single best statutory benchmark match for a bill line item."""
        matches = self.search_procedure(item_name, top_k=1)
        if matches and matches[0]["similarity_score"] >= threshold:
            return matches[0]
        return None


# Global Singleton
semantic_search_engine = SemanticVectorSearchEngine()
