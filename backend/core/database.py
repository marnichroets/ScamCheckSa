from motor.motor_asyncio import AsyncIOMotorClient
from core.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.db_name]
    await db.reports.create_index([("phone", 1)])
    await db.reports.create_index([("bank_account", 1)])
    await db.reports.create_index([("id_number", 1)])
    await db.reports.create_index([("name", "text"), ("description", "text")])


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
