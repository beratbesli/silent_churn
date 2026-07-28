from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.database import init_db
from app.routes.customers import router as customers_router
from app.routes.providers import router as providers_router
from app.routes.chat import router as chat_router


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
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customers_router)
app.include_router(providers_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {"message": "Welcome to Silent Churn API", "version": "1.0.0"}
