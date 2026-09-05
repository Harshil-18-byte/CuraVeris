import os
import io
import hashlib
import logging
from datetime import datetime, date
from pathlib import Path
from uuid import UUID
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding
from app.models.evidence import EvidenceRecord
from app.models.legal_doc import LegalDocument
from app.core.storage import StorageAdapter
from app.core.config import settings

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent.parent / 'legal_docs' / 'templates'

DOCUMENT_TYPES = {
    'HOSPITAL_COMPLAINT': {
        'template': 'hospital_complaint.html',
        'filename_prefix': 'Hospital_Complaint',
        'display_name': 'Formal Complaint to Hospital',
    },
    'ANTI_DETENTION': {
        'template': 'anti_detention.html',
        'filename_prefix': 'Anti_Detention_Notice',
        'display_name': 'Anti-Detention Notice',
    },
    'INSURANCE_DISPUTE': {
        'template': 'insurance_dispute.html',
        'filename_prefix': 'Insurance_Dispute',
        'display_name': 'Insurance Dispute Letter',
    },
    'OMBUDSMAN_PETITION': {
        'template': 'ombudsman_petition.html',
        'filename_prefix': 'Ombudsman_Petition',
        'display_name': 'Insurance Ombudsman Petition',
    },
    'CONSUMER_COURT': {
        'template': 'consumer_court.html',
        'filename_prefix': 'Consumer_Court_Notice',
        'display_name': 'Consumer Court Notice',
    },
    'CGHS_GRIEVANCE': {
        'template': 'cghs_grievance.html',
        'filename_prefix': 'CGHS_Grievance',
        'display_name': 'CGHS Grievance Letter',
    },
}

FINDING_TYPE_PLAIN = {
    'CGHS_OVERCHARGE': 'Charged above government CGHS rate',
    'NPPA_VIOLATION': 'Charged above government medical device price cap',
    'DPCO_VIOLATION': 'Charged above government medicine price cap',
    'IRDAI_NON_PAYABLE': 'Item not payable under insurance rules',
    'GST_MISAPPLICATION': 'GST wrongly applied to exempt service',
    'SHADOW_BILL': 'Possible duplicate or phantom charge',
    'PMJAY_NON_COMPLIANT': 'Charge exceeds PM-JAY approved package rate',
}

STATUTORY_REF_PLAIN = {
    'CGHS_OVERCHARGE': 'CGHS Rate Schedule, Ministry of Health & Family Welfare',
    'NPPA_VIOLATION': 'NPPA Price Cap Order, National Pharmaceutical Pricing Authority',
    'DPCO_VIOLATION': 'Drug Prices Control Order, 2013 (Essential Commodities Act)',
    'IRDAI_NON_PAYABLE': 'IRDAI Non-Payable Items List',
    'GST_MISAPPLICATION': 'Notification No. 12/2017-CT(R) — GST Healthcare Exemption',
    'SHADOW_BILL': 'Consumer Protection Act, 2019 — Unfair Trade Practice',
    'PMJAY_NON_COMPLIANT': 'PM-JAY Package Rate Schedule',
}


def format_inr(amount) -> str:
    if amount is None:
        return '0'
    try:
        num = float(amount)
        if num >= 10000000:
            return f"{num/10000000:.2f} Crore"
        elif num >= 100000:
            return f"{num/100000:.2f} Lakh"
        else:
            return f"{num:,.0f}"
    except (ValueError, TypeError):
        return str(amount)


def format_date_display(d) -> str:
    if d is None:
        return ''
    if isinstance(d, str):
        return d
    if isinstance(d, (date, datetime)):
        return d.strftime('%d %B %Y')
    return str(d)


def build_template_context(
    bill: Bill,
    audit: Audit,
    findings: list[AuditFinding],
    evidence: EvidenceRecord | None,
    user,
    extra_inputs: dict,
    doc_type: str,
) -> dict:
    now = datetime.now()

    formatted_findings = []
    for f in findings:
        if f.finding_source != 'DETERMINISTIC':
            continue
        formatted_findings.append({
            'item_description': f.item_description or 'Unspecified item',
            'category_plain': FINDING_TYPE_PLAIN.get(f.finding_type, f.finding_type),
            'billed_amount_formatted': format_inr(f.billed_amount),
            'benchmark_amount_formatted': format_inr(f.benchmark_amount),
            'overcharge_amount_formatted': format_inr(f.overcharge_amount),
            'statutory_reference_plain': STATUTORY_REF_PLAIN.get(
                f.finding_type, f.statutory_reference or ''
            ),
            'user_explanation': f.user_explanation or f.legal_basis or '',
            'dispute_basis': f.user_explanation or 'Contrary to applicable IRDAI guidelines',
            'insurer_decision': 'Disallowed',
        })

    cghs_findings = [
        f for f in formatted_findings
        if 'CGHS' in f['statutory_reference_plain']
    ]

    total_overcharge = float(audit.total_overcharge_deterministic or 0)
    total_billed = float(bill.total_billed_amount or 0)
    undisputed = max(0.0, total_billed - total_overcharge)
    admissible = total_billed - (total_overcharge * 0.5)
    compensation = min(total_overcharge * 0.5, 100000)

    finding_types = {f.finding_type for f in findings}

    return {
        'audit_id': str(audit.id)[:16].upper(),
        'reference_number': str(bill.id)[:8].upper(),
        'document_date': now.strftime('%d %B %Y'),
        'document_time': now.strftime('%I:%M %p'),
        'bill_reference': bill.reference_number or str(bill.id)[:8],
        'bill_date': format_date_display(bill.created_at),
        'admission_date': format_date_display(bill.admission_date),
        'discharge_date': format_date_display(bill.discharge_date),
        'hospital_name': bill.hospital_name or 'The Hospital',
        'hospital_address': extra_inputs.get('hospital_address', '[Hospital Address]'),
        'patient_name': bill.patient_name or (user.full_name if user else None) or 'The Patient',
        'patient_id': None,
        'patient_address': extra_inputs.get('patient_address', '[Patient Address]'),
        'patient_phone': (user.phone_number if user else None) or extra_inputs.get('patient_phone', '[Phone]'),
        'patient_email': (user.email if user else None) or '[Email]',
        'patient_city': extra_inputs.get('patient_city', '[City]'),
        'complainant_name': (user.full_name if user else None) or 'The Complainant',
        'relationship': extra_inputs.get('relationship', 'family member'),
        'total_billed_formatted': format_inr(total_billed),
        'total_overcharge_formatted': format_inr(total_overcharge),
        'undisputed_amount_formatted': format_inr(undisputed),
        'admissible_amount_formatted': format_inr(admissible),
        'compensation_amount_formatted': format_inr(compensation),
        'finding_count': len(formatted_findings),
        'findings': formatted_findings,
        'cghs_findings': cghs_findings,
        'has_cghs_violations': 'CGHS_OVERCHARGE' in finding_types,
        'has_nppa_violations': 'NPPA_VIOLATION' in finding_types,
        'has_dpco_violations': 'DPCO_VIOLATION' in finding_types,
        'has_irdai_violations': 'IRDAI_NON_PAYABLE' in finding_types,
        'has_gst_violations': 'GST_MISAPPLICATION' in finding_types,
        'insurer_name': extra_inputs.get('insurer_name', bill.tpa_name or '[Insurance Company]'),
        'insurer_address': extra_inputs.get('insurer_address', '[Insurer Address]'),
        'tpa_name': bill.tpa_name,
        'policy_number': bill.policy_number or extra_inputs.get('policy_number', '[Policy Number]'),
        'claim_number': extra_inputs.get('claim_number', ''),
        'claim_rejected': extra_inputs.get('claim_rejected', False),
        'is_policyholder': extra_inputs.get('is_policyholder', True),
        'policyholder_name': extra_inputs.get('policyholder_name', (user.full_name if user else '')),
        'ombudsman_jurisdiction': extra_inputs.get('ombudsman_jurisdiction', '[Your State]'),
        'diagnosis': extra_inputs.get('diagnosis', ''),
        'cghs_card_number': extra_inputs.get('cghs_card_number', ''),
        'cghs_office_city': extra_inputs.get('cghs_office_city', ''),
        'office_name': extra_inputs.get('office_name', ''),
        'employee_id': extra_inputs.get('employee_id', ''),
        'evidence_id': str(evidence.id)[:16].upper() if evidence else 'NOT GENERATED',
        'merkle_root': (evidence.merkle_root[:32] + '...') if evidence else 'NOT GENERATED',
        'evidence_issued_at': format_date_display(
            evidence.issued_at if evidence else None
        ) or format_date_display(now),
    }


_WEASYPRINT_AVAILABLE = None


def _is_weasyprint_available() -> bool:
    global _WEASYPRINT_AVAILABLE
    if _WEASYPRINT_AVAILABLE is None:
        if os.name == 'nt' and not os.environ.get('GTK_BASEPATH') and not os.environ.get('WEASYPRINT_DLL_DIRECTORIES'):
            # On Windows without explicit GTK runtime, avoid ctypes hang
            _WEASYPRINT_AVAILABLE = False
        else:
            try:
                import weasyprint
                _WEASYPRINT_AVAILABLE = True
            except Exception:
                _WEASYPRINT_AVAILABLE = False
    return _WEASYPRINT_AVAILABLE



def _render_pdf(html_content: str) -> bytes:
    """Render HTML content to PDF using WeasyPrint with ReportLab fallback if native libraries missing."""
    if _is_weasyprint_available():
        try:
            from weasyprint import HTML, CSS
            css = CSS(filename=str(TEMPLATES_DIR / 'base.css'))
            return HTML(string=html_content, base_url=str(TEMPLATES_DIR)).write_pdf(
                stylesheets=[css]
            )
        except Exception as e:
            logger.warning(f"WeasyPrint rendering failed ({e}). Falling back to ReportLab canvas...")
    
    return _render_pdf_reportlab_fallback(html_content)



def _render_pdf_reportlab_fallback(html_content: str) -> bytes:
    """Robust fallback PDF generator using ReportLab Platypus when WeasyPrint system libs unavailable."""
    import re
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        alignment=1,
        spaceAfter=8,
    )
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        spaceAfter=6,
    )
    box_style = ParagraphStyle(
        'DocBox',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#111827'),
    )

    story = []

    def clean_html_tags(raw_text: str) -> str:
        # Standardize line breaks
        t = re.sub(r'<br\s*/?>', '<br/>', raw_text, flags=re.IGNORECASE)
        # Strip all tags except b, i, u, br
        t = re.sub(r'<(?!/?(b|i|u|br/)\b)[^>]+>', '', t)
        # Fix unclosed br tags
        t = re.sub(r'<br>', '<br/>', t, flags=re.IGNORECASE)
        t = t.replace('&nbsp;', ' ')
        return t.strip()


    # Clean scripts & styles
    clean_lines = re.sub(r'<style.*?</style>', '', html_content, flags=re.DOTALL)
    clean_lines = re.sub(r'<script.*?</script>', '', clean_lines, flags=re.DOTALL)

    # Extract titles and paragraphs
    headers = re.findall(r'<h[12][^>]*>(.*?)</h[12]>', clean_lines, flags=re.DOTALL)
    for h in headers:
        text = clean_html_tags(h)
        if text:
            story.append(Paragraph(f"<b>{text}</b>", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceAfter=8))

    paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', clean_lines, flags=re.DOTALL)
    for p in paragraphs:
        text = clean_html_tags(p)
        if text:
            if 'SUBJECT:' in text or 'Subject:' in text:
                story.append(Paragraph(f"<b><u>{text}</u></b>", h2_style))
            else:
                story.append(Paragraph(text, body_style))

    # Add evidence box
    evidence_matches = re.findall(r'<div class="evidence-box">(.*?)</div>', clean_lines, flags=re.DOTALL)
    for ev in evidence_matches:
        ev_clean = re.sub(r'<br\s*/?>', '\n', ev)
        ev_clean = clean_html_tags(ev_clean).replace('\n', '<br/>')
        story.append(Spacer(1, 8))
        story.append(Paragraph(f"<b>AUDIT CERTIFICATE VERIFICATION:</b><br/>{ev_clean}", box_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


async def generate_legal_document(
    bill_id: UUID,
    doc_type: str,
    extra_inputs: dict,
    db: AsyncSession,
    storage: StorageAdapter,
    user,
) -> LegalDocument:
    if doc_type not in DOCUMENT_TYPES:
        raise ValueError(f"Unknown document type: {doc_type}")

    bill = (await db.execute(
        select(Bill).where(Bill.id == bill_id)
    )).scalar_one_or_none()

    if not bill:
        raise ValueError(f"Bill not found: {bill_id}")

    audit = (await db.execute(
        select(Audit).where(Audit.bill_id == bill_id)
    )).scalar_one_or_none()

    if not audit:
        raise ValueError("Audit must be completed before generating documents")

    findings = (await db.execute(
        select(AuditFinding).where(AuditFinding.audit_id == audit.id)
    )).scalars().all()

    evidence = (await db.execute(
        select(EvidenceRecord).where(EvidenceRecord.bill_id == bill_id)
    )).scalar_one_or_none()

    context = build_template_context(
        bill=bill,
        audit=audit,
        findings=list(findings),
        evidence=evidence,
        user=user,
        extra_inputs=extra_inputs,
        doc_type=doc_type,
    )

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(['html']),
    )

    template_name = DOCUMENT_TYPES[doc_type]['template']
    template = env.get_template(template_name)
    html_content = template.render(**context)

    pdf_bytes = _render_pdf(html_content)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    prefix = DOCUMENT_TYPES[doc_type]['filename_prefix']
    filename = f"{prefix}_{timestamp}.pdf"
    storage_key = f"legal_docs/{bill.user_id}/{bill_id}/{filename}"

    await storage.upload_file(
        key=storage_key,
        file_obj=io.BytesIO(pdf_bytes),
        content_type='application/pdf',
        metadata={'bill_id': str(bill_id), 'doc_type': doc_type},
    )

    file_hash = hashlib.sha256(pdf_bytes).hexdigest()

    legal_doc = LegalDocument(
        bill_id=bill_id,
        audit_id=audit.id,
        user_id=bill.user_id,
        document_type=doc_type,
        template_version='1.0.0',
        file_key=storage_key,
        file_hash_sha256=file_hash,
        status='READY',
        generated_at=datetime.utcnow(),
        metadata={
            'filename': filename,
            'page_count': None,
            'finding_count': len([f for f in findings if f.finding_source == 'DETERMINISTIC']),
            'total_overcharge': str(audit.total_overcharge_deterministic),
        },
    )

    db.add(legal_doc)
    await db.commit()
    await db.refresh(legal_doc)

    return legal_doc
