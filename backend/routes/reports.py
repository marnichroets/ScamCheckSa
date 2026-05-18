import re
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models.report import ReportCreate, ReportOut, DisputeCreate
from core.database import get_db

router = APIRouter(prefix="/api/reports", tags=["reports"])

VALID_FIELDS = {"phone", "bank_account", "id_number", "name", "category", "all"}


def _mask_phone(phone: str) -> str:
    if not phone:
        return phone
    digits = re.sub(r'\D', '', phone)
    if len(digits) < 5:
        return phone
    return digits[:3] + ' XXX XX' + digits[-2:]


def _mask_bank_account(account: str) -> str:
    if not account:
        return account
    clean = account.replace(' ', '')
    if len(clean) < 4:
        return account
    return 'XXXX XXXX ' + clean[-4:]


def _mask_id_number(id_num: str) -> str:
    if not id_num:
        return id_num
    if len(id_num) < 6:
        return id_num
    return id_num[:6] + ' XXXXXXX'


def serialize_report(doc: dict, mask_sensitive: bool = True) -> dict:
    doc["id"] = str(doc.pop("_id"))
    if mask_sensitive:
        if doc.get("phone"):
            doc["phone"] = _mask_phone(doc["phone"])
        if doc.get("bank_account"):
            doc["bank_account"] = _mask_bank_account(doc["bank_account"])
        if doc.get("id_number"):
            doc["id_number"] = _mask_id_number(doc["id_number"])
    return doc


@router.post("/", response_model=dict, status_code=201)
async def submit_report(report: ReportCreate, db=Depends(get_db)):
    if report.entity_type == "person":
        has_id = any([report.name, report.phone, report.bank_account, report.id_number])
    else:
        has_id = any([report.name, report.phone, report.bank_account, report.registration_number])

    if not has_id:
        raise HTTPException(
            status_code=422,
            detail="At least one identifier is required.",
        )

    doc = report.dict()
    doc["status"] = "pending"
    doc["dispute_status"] = None
    doc["created_at"] = datetime.utcnow()
    doc["reviewed_at"] = None
    doc["reviewed_by"] = None

    result = await db.reports.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Report submitted and pending review."}


@router.get("/stats", response_model=dict)
async def get_stats(db=Depends(get_db)):
    total = await db.reports.count_documents({})
    verified = await db.reports.count_documents({"status": "verified"})
    pending = await db.reports.count_documents({"status": "pending"})

    pipeline = [
        {"$match": {"status": "verified", "amount_lost": {"$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount_lost"}}},
    ]
    result = await db.reports.aggregate(pipeline).to_list(length=1)
    total_amount = result[0]["total"] if result else 0

    return {
        "total_reports": total,
        "verified_reports": verified,
        "pending_reports": pending,
        "total_amount_lost": round(total_amount, 2),
    }


@router.get("/search", response_model=List[dict])
async def search_reports(
    q: str = Query(..., min_length=2),
    field: Optional[str] = Query("all"),
    db=Depends(get_db),
):
    q = q.strip()
    status_filter = {"status": "verified"}

    if field == "phone":
        query = {**status_filter, "phone": {"$regex": q, "$options": "i"}}
    elif field == "bank_account":
        query = {**status_filter, "bank_account": {"$regex": q, "$options": "i"}}
    elif field == "id_number":
        query = {**status_filter, "id_number": {"$regex": q, "$options": "i"}}
    elif field == "name":
        query = {**status_filter, "name": {"$regex": q, "$options": "i"}}
    elif field == "category":
        query = {**status_filter, "category": q.lower()}
    else:
        query = {
            **status_filter,
            "$or": [
                {"phone": {"$regex": q, "$options": "i"}},
                {"bank_account": {"$regex": q, "$options": "i"}},
                {"id_number": {"$regex": q, "$options": "i"}},
                {"name": {"$regex": q, "$options": "i"}},
                {"registration_number": {"$regex": q, "$options": "i"}},
                {"website": {"$regex": q, "$options": "i"}},
            ],
        }

    cursor = db.reports.find(query).sort("created_at", -1).limit(200)
    results = []
    async for doc in cursor:
        results.append(serialize_report(doc, mask_sensitive=True))

    return results


@router.get("/{report_id}", response_model=dict)
async def get_report(report_id: str, db=Depends(get_db)):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID.")
    doc = await db.reports.find_one({"_id": ObjectId(report_id), "status": "verified"})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found.")
    return serialize_report(doc, mask_sensitive=True)


@router.post("/{report_id}/dispute", response_model=dict, status_code=201)
async def submit_dispute(report_id: str, dispute: DisputeCreate, db=Depends(get_db)):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID.")

    report = await db.reports.find_one({"_id": ObjectId(report_id), "status": "verified"})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    dispute_doc = dispute.dict()
    dispute_doc["report_id"] = report_id
    dispute_doc["status"] = "pending"
    dispute_doc["created_at"] = datetime.utcnow()
    dispute_doc["resolved_at"] = None

    await db.disputes.insert_one(dispute_doc)

    await db.reports.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"dispute_status": "under_review"}},
    )

    return {"message": "Dispute submitted. Our team will review it within 3–5 business days."}
