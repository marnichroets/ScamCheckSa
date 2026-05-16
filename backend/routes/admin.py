from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId
import anthropic

from ..models.report import StatusUpdate
from ..core.database import get_db
from ..core.config import get_settings
from .auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])
settings = get_settings()


def serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/reports", response_model=list)
async def list_reports(
    status: Optional[str] = Query("pending"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db=Depends(get_db),
    _=Depends(require_admin),
):
    query = {}
    if status and status != "all":
        query["status"] = status

    cursor = db.reports.find(query).sort("created_at", -1).skip(skip).limit(limit)
    results = []
    async for doc in cursor:
        results.append(serialize(doc))
    return results


@router.patch("/reports/{report_id}", response_model=dict)
async def update_report_status(
    report_id: str,
    update: StatusUpdate,
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID.")

    result = await db.reports.update_one(
        {"_id": ObjectId(report_id)},
        {
            "$set": {
                "status": update.status,
                "reviewed_at": datetime.utcnow(),
                "reviewed_by": admin.get("username", "admin"),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found.")
    return {"message": f"Report {update.status}."}


@router.delete("/reports/{report_id}", response_model=dict)
async def delete_report(
    report_id: str,
    db=Depends(get_db),
    _=Depends(require_admin),
):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID.")

    result = await db.reports.delete_one({"_id": ObjectId(report_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found.")
    return {"message": "Report deleted."}


class FacebookPostInput(BaseModel):
    text: str
    source_url: Optional[str] = None


PARSE_SYSTEM_PROMPT = """You are a scam report extractor for ScamCheckSA, a South African scam registry.
Extract structured data from Facebook posts about scammers.

Return ONLY valid JSON with these fields (use null for missing values):
{
  "name": "full name of scammer or null",
  "phone": "phone number or null",
  "bank_account": "bank account number or null",
  "bank_name": "bank name (FNB, Capitec, ABSA, Standard Bank, Nedbank, etc.) or null",
  "id_number": "SA ID number (13 digits) or null",
  "amount_lost": numeric amount in ZAR or null,
  "description": "concise description of the scam in 1-3 sentences",
  "category": one of: "romance", "investment", "phishing", "job", "shopping", "other"
}

Be conservative — only extract information explicitly stated in the post.
"""


@router.post("/parse-facebook-post", response_model=dict)
async def parse_facebook_post(
    payload: FacebookPostInput,
    _=Depends(require_admin),
):
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="Anthropic API key not configured.")

    if len(payload.text.strip()) < 20:
        raise HTTPException(status_code=422, detail="Post text is too short to parse.")

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=PARSE_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Extract scammer details from this Facebook post:\n\n{payload.text}",
                }
            ],
        )
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    import json

    raw = message.content[0].text.strip()
    try:
        extracted = json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            raise HTTPException(status_code=502, detail="Could not parse Claude response as JSON.")
        extracted = json.loads(match.group())

    extracted["source"] = "facebook"
    if payload.source_url:
        extracted["source_url"] = payload.source_url

    return {"extracted": extracted, "raw_response": raw}
