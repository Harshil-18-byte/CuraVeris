"""ReportLab Forensic Audit PDF Generation Service."""

import io
from typing import Dict, Any
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.pdfgen import canvas
    HAS_REPORTLAB = True
    _BaseCanvas = canvas.Canvas
except Exception:
    HAS_REPORTLAB = False
    canvas = None
    _BaseCanvas = object


class NumberedCanvas(_BaseCanvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 750, "CuraVeris / MedBill AI — Medico-Legal Billing Audit")
        self.drawRightString(558, 750, "Statutory Compliance Report")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 744, 558, 744)
        self.line(54, 50, 558, 50)
        self.drawString(54, 38, "Admissible under Section 65B of Indian Evidence Act | Privileged Patient Record")
        self.drawRightString(558, 38, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


class ReportService:
    def generate_audit_pdf(self, bill_data: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=54, rightMargin=54, topMargin=60, bottomMargin=60)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle("T", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=colors.HexColor("#0F172A"))
        h2_style = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=colors.HexColor("#1E293B"), spaceBefore=12, spaceAfter=6)
        body_style = ParagraphStyle("B", fontName="Helvetica", fontSize=9, leading=13, textColor=colors.HexColor("#334155"))
        bold_style = ParagraphStyle("BB", parent=body_style, fontName="Helvetica-Bold")
        alert_style = ParagraphStyle("A", parent=body_style, fontName="Helvetica-Bold", textColor=colors.HexColor("#DC2626"))

        elements = []
        elements.append(Paragraph("FORENSIC MEDICAL INVOICE AUDIT", title_style))
        elements.append(Paragraph("Statutory Benchmark Cross-Referencing & Legal Advocacy Evidence", body_style))
        elements.append(Spacer(1, 12))

        # Metrics Table
        hospital_name = bill_data.get("hospital_name", "Hospital Entity")
        total_billed = float(bill_data.get("total_billed", bill_data.get("total_amount", 0.0)))
        disputed = float(bill_data.get("total_overcharge", bill_data.get("potential_savings", 0.0)))
        risk_score = int(bill_data.get("risk_score", 0))

        metrics = [
            [Paragraph("<b>Hospital Name:</b>", body_style), Paragraph(hospital_name, bold_style), Paragraph("<b>Invoice No:</b>", body_style), Paragraph(str(bill_data.get("bill_number", "N/A")), body_style)],
            [Paragraph("<b>Total Billed:</b>", body_style), Paragraph(f"₹{total_billed:,.2f}", bold_style), Paragraph("<b>Identified Overcharge:</b>", body_style), Paragraph(f"₹{disputed:,.2f}", alert_style)],
            [Paragraph("<b>Risk Score:</b>", body_style), Paragraph(f"<b>{risk_score}/100</b>", bold_style), Paragraph("<b>Audit Status:</b>", body_style), Paragraph("COMPLETED", bold_style)],
        ]
        t = Table(metrics, colWidths=[120, 150, 110, 124])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 14))

        elements.append(Paragraph("1. Plain-Language Executive Summary", h2_style))
        summary = bill_data.get("plain_summary", "Forensic audit completed against CGHS, NPPA, and DPCO statutory rates.")
        elements.append(Paragraph(summary, body_style))
        elements.append(Spacer(1, 14))

        elements.append(Paragraph("2. Statutory Price Ceilings & Violations", h2_style))
        flags = bill_data.get("risk_flags_summary", bill_data.get("risk_flags", []))
        if flags:
            rows = [[Paragraph("<b>Violation</b>", bold_style), Paragraph("<b>Item Name</b>", bold_style), Paragraph("<b>Impact</b>", bold_style)]]
            for f in flags:
                if isinstance(f, dict):
                    rows.append([
                        Paragraph(str(f.get("type", f.get("flag_type", "VIOLATION"))), body_style),
                        Paragraph(str(f.get("item", f.get("item_name", "N/A"))), body_style),
                        Paragraph(f"₹{float(f.get('impact', f.get('amount_impact', 0.0))):,.2f}", alert_style),
                    ])
            ft = Table(rows, colWidths=[150, 234, 120])
            ft.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(ft)
        else:
            elements.append(Paragraph("No direct price ceiling breaches identified.", body_style))

        elements.append(PageBreak())
        elements.append(Paragraph("3. Certificate of Electronic Evidence (Section 65B)", h2_style))
        cert = (
            "This document is an electronically produced forensic record generated in the ordinary course of computer operations. "
            "It deterministic cross-references healthcare bills against statutory notifications from the National Pharmaceutical Pricing Authority (NPPA), "
            "Drugs Prices Control Order (DPCO), and Central Government Health Scheme (CGHS)."
        )
        ct = Table([[Paragraph(cert, ParagraphStyle("C", parent=body_style, fontSize=8))]], colWidths=[504])
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#94A3B8")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(ct)

        doc.build(elements, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()


report_service = ReportService()
