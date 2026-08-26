from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.db.models import Bill
from app.models.schemas import ChatRequest, ChatResponse
from app.engine.ai_explainer import ai_explainer

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("/stream")
async def stream_chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Stream token-by-token contextual explanation about a specific bill via SSE.
    """
    result = await db.execute(
        select(Bill).where(Bill.id == req.bill_id).options(selectinload(Bill.items))
    )
    bill = result.scalars().first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill_context = {
        "bill_id": bill.id,
        "hospital_name": bill.hospital_name,
        "diagnosis": bill.diagnosis,
        "total_billed": bill.total_billed,
        "total_overcharge": bill.total_overcharge,
        "risk_score": bill.risk_score,
        "risk_flags_summary": bill.risk_flags_summary,
        "items": [
            {
                "raw_text": i.raw_text,
                "charged_rate": i.charged_rate,
                "charged_amount": i.charged_amount,
                "risk_flags": i.risk_flags,
                "legal_citation": i.legal_citation
            }
            for i in bill.items
        ]
    }

    async def event_generator():
        async for chunk in ai_explainer.stream_chat_response(bill_context, req.message):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/", response_model=ChatResponse)
async def standard_chat(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Non-streaming JSON response fallback for standard clients."""
    result = await db.execute(
        select(Bill).where(Bill.id == req.bill_id).options(selectinload(Bill.items))
    )
    bill = result.scalars().first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill_context = {
        "bill_id": bill.id,
        "hospital_name": bill.hospital_name,
        "diagnosis": bill.diagnosis,
        "total_billed": bill.total_billed,
        "total_overcharge": bill.total_overcharge,
        "risk_score": bill.risk_score,
        "risk_flags_summary": bill.risk_flags_summary,
        "items": [
            {
                "raw_text": i.raw_text,
                "charged_rate": i.charged_rate,
                "charged_amount": i.charged_amount,
                "risk_flags": i.risk_flags,
                "legal_citation": i.legal_citation
            }
            for i in bill.items
        ]
    }

    full_reply = []
    async for chunk in ai_explainer.stream_chat_response(bill_context, req.message):
        full_reply.append(chunk)

    reply_text = "".join(full_reply)
    
    citations = [
        "Drugs (Prices Control) Order, 2013",
        "NPPA Price Ceiling Orders",
        "GST Notification No. 12/2017-Central Tax (Rate)",
        "Consumer Protection Act, 2019 Section 2(47)"
    ]

    return ChatResponse(
        reply=reply_text,
        legal_citations=citations,
        suggested_actions=["Generate Grievance Notice", "File NPPA Complaint", "Request TPA Reimbursement"]
    )
