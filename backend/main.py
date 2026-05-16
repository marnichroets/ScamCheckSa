from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.database import connect_db, close_db
from .routes import reports, auth, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="ScamCheckSA API",
    description="South African scam reporting and verification platform.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router)
app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {"service": "ScamCheckSA API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
