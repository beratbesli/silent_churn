"""Access control for customer data and destructive demo operations."""

import os
import secrets

from fastapi import HTTPException, Request


DEFAULT_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
)


def allowed_origins() -> tuple[str, ...]:
    configured = os.getenv("SILENT_CHURN_ALLOWED_ORIGINS", "")
    return tuple(origin.strip() for origin in configured.split(",") if origin.strip()) or DEFAULT_ORIGINS


def _bearer_token(request: Request) -> str:
    scheme, _, token = request.headers.get("authorization", "").partition(" ")
    if scheme.lower() != "bearer" or not token or " " in token:
        raise HTTPException(status_code=401, detail="Bearer token required")
    return token


def require_reader(request: Request) -> None:
    reader = os.getenv("SILENT_CHURN_API_TOKEN", "")
    admin = os.getenv("SILENT_CHURN_ADMIN_TOKEN", "")
    if not reader:
        raise HTTPException(status_code=503, detail="API access is not configured")
    supplied = _bearer_token(request)
    if secrets.compare_digest(supplied, reader):
        return
    if admin and admin != reader and secrets.compare_digest(supplied, admin):
        return
    raise HTTPException(status_code=401, detail="Invalid bearer token")


def require_admin(request: Request) -> None:
    if os.getenv("SILENT_CHURN_ENV", "").lower() == "production":
        raise HTTPException(status_code=403, detail="Demo data generation is disabled in production")
    reader = os.getenv("SILENT_CHURN_API_TOKEN", "")
    admin = os.getenv("SILENT_CHURN_ADMIN_TOKEN", "")
    if not reader or not admin or admin == reader:
        raise HTTPException(status_code=503, detail="Admin access is not configured")
    if not secrets.compare_digest(_bearer_token(request), admin):
        raise HTTPException(status_code=403, detail="Admin access required")
