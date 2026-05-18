from pydantic import BaseModel, Field, ConfigDict, GetCoreSchemaHandler
from pydantic_core import core_schema
from typing import Optional, Literal, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: GetCoreSchemaHandler):
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema: Any, handler: Any) -> dict:
        return {"type": "string"}


class ReportCreate(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "John Doe",
                "phone": "0821234567",
                "bank_account": "1234567890",
                "bank_name": "FNB",
                "description": "Promised returns on crypto investment, disappeared after payment.",
                "category": "investment",
                "amount_lost": 15000,
            }
        }
    )

    entity_type: Literal["person", "business"] = "person"
    name: Optional[str] = None
    phone: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    id_number: Optional[str] = None
    registration_number: Optional[str] = None
    website: Optional[str] = None
    amount_lost: Optional[float] = None
    description: str
    category: Literal["romance", "investment", "phishing", "job", "shopping", "other"] = "other"
    source: Literal["manual", "facebook", "api"] = "manual"


class ReportInDB(ReportCreate):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    status: Literal["pending", "verified", "rejected"] = "pending"
    dispute_status: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    entity_type: str = "person"
    name: Optional[str] = None
    phone: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    id_number: Optional[str] = None
    registration_number: Optional[str] = None
    website: Optional[str] = None
    amount_lost: Optional[float] = None
    description: str
    category: str
    status: str
    source: str
    dispute_status: Optional[str] = None
    created_at: datetime


class StatusUpdate(BaseModel):
    status: Literal["verified", "rejected"]
    reviewed_by: Optional[str] = "admin"


class SearchQuery(BaseModel):
    q: str
    field: Optional[Literal["phone", "bank_account", "id_number", "name", "all"]] = "all"


class DisputeCreate(BaseModel):
    name: str
    email: str
    id_number: str
    reason: str
    evidence_notes: Optional[str] = None


class DisputeAction(BaseModel):
    action: Literal["uphold", "dismiss"]
