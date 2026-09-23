from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from app.database import init_db
from app.routes.customers import router as customers_router
from app.routes.providers import router as providers_router
from app.routes.chat import router as chat_router
from app.security import allowed_origins, require_reader


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Silent Churn API",
    description="Backend for Silent Churn - Early Warning System for Customer Churn",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def reject_cross_origin_mutations(request: Request, call_next):
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        origin = request.headers.get("origin")
        if origin and origin not in allowed_origins():
            return JSONResponse({"detail": "Origin not allowed"}, status_code=403)
    return await call_next(request)


protected = [Depends(require_reader)]
app.include_router(customers_router, dependencies=protected)
app.include_router(providers_router, dependencies=protected)
app.include_router(chat_router, dependencies=protected)


@app.get("/")
def root():
    return {"message": "Welcome to Silent Churn API", "version": "1.0.0"}
