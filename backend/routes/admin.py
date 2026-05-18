import json
import re
import base64
from fastapi import APIRouter, HTTPException, Depends, Query, Form, File, UploadFile
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import anthropic

from models.report import StatusUpdate, DisputeAction
from core.database import get_db
from core.config import get_settings
from routes.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])
settings = get_settings()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


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


PARSE_SYSTEM_PROMPT = """You are a scam report extractor for ScamCheckSA, a South African scam registry.
Extract structured data from Facebook posts or screenshots about scammers.

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

Be conservative — only extract information explicitly stated in the post or visible in the image.
"""


@router.post("/parse-facebook-post", response_model=dict)
async def parse_facebook_post(
    text: Optional[str] = Form(None),
    source_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    _=Depends(require_admin),
):
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="Anthropic API key not configured.")

    has_text = bool(text and text.strip())
    has_image = file is not None and file.filename

    if not has_text and not has_image:
        raise HTTPException(status_code=422, detail="Provide post text, an image, or both.")

    content = []

    if has_image:
        media_type = file.content_type or "image/jpeg"
        if media_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=422,
                detail=f"Unsupported image type '{media_type}'. Use JPEG, PNG, GIF, or WebP.",
            )
        image_bytes = await file.read()
        if len(image_bytes) > 20 * 1024 * 1024:
            raise HTTPException(status_code=422, detail="Image exceeds 20 MB limit.")

        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media_type,
                "data": base64.standard_b64encode(image_bytes).decode(),
            },
        })

    if has_text and has_image:
        prompt = f"Extract scammer details from this Facebook post screenshot. Additional context from the post:\n\n{text.strip()}"
    elif has_image:
        prompt = "Extract scammer details from this Facebook post screenshot."
    else:
        prompt = f"Extract scammer details from this Facebook post:\n\n{text.strip()}"

    content.append({"type": "text", "text": prompt})

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=PARSE_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {str(e)}")

    raw = message.content[0].text.strip()
    try:
        extracted = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            raise HTTPException(status_code=502, detail="Could not parse Claude response as JSON.")
        extracted = json.loads(match.group())

    extracted["source"] = "facebook"
    if source_url:
        extracted["source_url"] = source_url

    return {"extracted": extracted, "raw_response": raw}


@router.get("/disputes", response_model=list)
async def list_disputes(
    status: Optional[str] = Query("pending"),
    db=Depends(get_db),
    _=Depends(require_admin),
):
    query = {} if status == "all" else {"status": status}
    cursor = db.disputes.find(query).sort("created_at", -1).limit(200)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(doc)
    return results


@router.patch("/disputes/{dispute_id}", response_model=dict)
async def resolve_dispute(
    dispute_id: str,
    body: DisputeAction,
    db=Depends(get_db),
    admin=Depends(require_admin),
):
    if not ObjectId.is_valid(dispute_id):
        raise HTTPException(status_code=400, detail="Invalid dispute ID.")

    dispute = await db.disputes.find_one({"_id": ObjectId(dispute_id)})
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found.")

    report_id = dispute.get("report_id")

    await db.disputes.update_one(
        {"_id": ObjectId(dispute_id)},
        {"$set": {"status": "upheld" if body.action == "uphold" else "dismissed", "resolved_at": datetime.utcnow()}},
    )

    if body.action == "uphold" and report_id and ObjectId.is_valid(report_id):
        await db.reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"status": "rejected", "dispute_status": "upheld"}},
        )
    elif body.action == "dismiss" and report_id and ObjectId.is_valid(report_id):
        await db.reports.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"dispute_status": None}},
        )

    return {"message": f"Dispute {body.action}ed."}
