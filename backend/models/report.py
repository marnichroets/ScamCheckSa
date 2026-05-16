from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class ReportCreate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    id_number: Optional[str] = None
    amount_lost: Optional[float] = None
    description: str
    category: Literal["romance", "investment", "phishing", "job", "shopping", "other"] = "other"
    source: Literal["manual", "facebook", "api"] = "manual"

    class Config:
        schema_extra = {
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


class ReportInDB(ReportCreate):
    id: Optional[PyObjectId] = Field(alias="_id")
    status: Literal["pending", "verified", "rejected"] = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ReportOut(BaseModel):
    id: str
    name: Optional[str]
    phone: Optional[str]
    bank_account: Optional[str]
    bank_name: Optional[str]
    id_number: Optional[str]
    amount_lost: Optional[float]
    description: str
    category: str
    status: str
    source: str
    created_at: datetime

    class Config:
        schema_extra = {}


class StatusUpdate(BaseModel):
    status: Literal["verified", "rejected"]
    reviewed_by: Optional[str] = "admin"


class SearchQuery(BaseModel):
    q: str
    field: Optional[Literal["phone", "bank_account", "id_number", "name", "all"]] = "all"
