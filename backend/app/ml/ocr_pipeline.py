"""OCR Pipeline Module: AWS Textract primary engine with Tesseract fallback."""

import io
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from PIL import Image

try:
    import fitz
except ImportError:
    fitz = None

from app.core.config import settings
from app.core.logging import logger


@dataclass
class ExtractedBlock:
    """Represents a text line or cell extracted from OCR with spatial coordinates."""
    text: str
    confidence: float
    bbox: Dict[str, float]
    page_number: int = 1
    block_type: str = "LINE"


class OCRPipeline:
    """Multi-modal OCR engine handling AWS Textract with automatic local Tesseract fallback."""

    def __init__(self):
        self.use_textract = getattr(settings, "USE_TEXTRACT", False) and bool(getattr(settings, "AWS_ACCESS_KEY_ID", ""))
        self.textract_client = None

        if self.use_textract:
            try:
                import boto3
                self.textract_client = boto3.client(
                    "textract",
                    region_name=getattr(settings, "AWS_REGION", "ap-south-1"),
                    aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", ""),
                    aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", ""),
                )
            except Exception as exc:
                logger.warning(f"AWS Textract init deferred: {exc}")
                self.use_textract = False

    def process_document(self, file_bytes: bytes, mime_type: str) -> List[ExtractedBlock]:
        """Extract text blocks using Textract if configured, else Tesseract fallback."""
        if self.use_textract and self.textract_client:
            try:
                return self._process_textract(file_bytes, mime_type)
            except Exception as exc:
                logger.error(f"Textract failed: {exc}. Using Tesseract.")

        return self._process_tesseract(file_bytes, mime_type)

    def _process_textract(self, file_bytes: bytes, mime_type: str) -> List[ExtractedBlock]:
        response = self.textract_client.analyze_document(
            Document={"Bytes": file_bytes},
            FeatureTypes=["TABLES", "FORMS"]
        )
        blocks = []
        for b in response.get("Blocks", []):
            if b.get("BlockType") in ("LINE", "CELL"):
                text = b.get("Text", "").strip()
                if not text:
                    continue
                box = b.get("Geometry", {}).get("BoundingBox", {})
                blocks.append(ExtractedBlock(
                    text=text,
                    confidence=float(b.get("Confidence", 0.0)) / 100.0,
                    bbox={
                        "left": float(box.get("Left", 0.0)),
                        "top": float(box.get("Top", 0.0)),
                        "width": float(box.get("Width", 0.0)),
                        "height": float(box.get("Height", 0.0)),
                    },
                    page_number=b.get("Page", 1),
                    block_type=b.get("BlockType", "LINE")
                ))
        return blocks

    def _process_tesseract(self, file_bytes: bytes, mime_type: str) -> List[ExtractedBlock]:
        blocks = []
        try:
            images = []
            if mime_type == "application/pdf":
                if fitz is not None:
                    doc = fitz.open(stream=file_bytes, filetype="pdf")
                    for page in doc:
                        pix = page.get_pixmap(dpi=200)
                        images.append(Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB"))
                else:
                    try:
                        import pypdfium2 as pdfium
                        pdf = pdfium.PdfDocument(file_bytes)
                        for page in pdf:
                            image = page.render(scale=2.0).to_pil()
                            images.append(image.convert("RGB"))
                    except Exception as e:
                        logger.warning(f"PDF rendering fallback note: {e}")
            else:
                images.append(Image.open(io.BytesIO(file_bytes)).convert("RGB"))

            try:
                import pytesseract
                from pytesseract import Output
                for page_idx, img in enumerate(images, start=1):
                    w, h = img.size
                    data = pytesseract.image_to_data(img, output_type=Output.DICT)
                    for i in range(len(data["text"])):
                        t = data["text"][i].strip()
                        if t and float(data["conf"][i]) > 0:
                            blocks.append(ExtractedBlock(
                                text=t,
                                confidence=float(data["conf"][i]) / 100.0,
                                bbox={
                                    "left": round(data["left"][i] / w, 4),
                                    "top": round(data["top"][i] / h, 4),
                                    "width": round(data["width"][i] / w, 4),
                                    "height": round(data["height"][i] / h, 4),
                                },
                                page_number=page_idx,
                                block_type="WORD"
                            ))
            except Exception as exc:
                logger.debug(f"Pytesseract fallback note: {exc}")
        except Exception as e:
            logger.error(f"Image conversion error: {e}")
        return blocks
