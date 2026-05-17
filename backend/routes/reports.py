from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from models.report import ReportCreate, ReportOut
from core.database import get_db

router = APIRouter(prefix="/api/reports", tags=["reports"])

VALID_FIELDS = {"phone", "bank_account", "id_number", "name", "category", "all"}


def serialize_report(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.post("/", response_model=dict, status_code=201)
async def submit_report(report: ReportCreate, db=Depends(get_db)):
    if not any([report.name, report.phone, report.bank_account, report.id_number]):
        raise HTTPException(
            status_code=422,
            detail="At least one identifier (name, phone, bank_account, or id_number) is required.",
        )

    doc = report.dict()
    doc["status"] = "pending"
    doc["created_at"] = datetime.utcnow()
    doc["reviewed_at"] = None
    doc["reviewed_by"] = None

    result = await db.reports.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Report submitted and pending review."}


# /stats must be defined before /{report_id} so FastAPI doesn't match "stats" as an ID
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
            ],
        }

    cursor = db.reports.find(query).sort("created_at", -1).limit(200)
    results = []
    async for doc in cursor:
        results.append(serialize_report(doc))

    return results


@router.get("/{report_id}", response_model=dict)
async def get_report(report_id: str, db=Depends(get_db)):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID.")
    doc = await db.reports.find_one({"_id": ObjectId(report_id), "status": "verified"})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found.")
    return serialize_report(doc)
