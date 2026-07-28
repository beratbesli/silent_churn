from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models import Customer, RiskScore, EmailMessage, MapsReview, FoodPlatformReview
from app.schemas import ChatRequest, ChatResponse
from app.providers import get_provider_manager

router = APIRouter(tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_data(request: ChatRequest):
    db = SessionLocal()
    try:
        provider = get_provider_manager().get_provider()
        if not provider:
            raise HTTPException(status_code=400, detail="No AI provider connected")

        at_risk = db.query(Customer).filter(Customer.risk_status == "at_risk").count()
        warning = db.query(Customer).filter(Customer.risk_status == "warning").count()
        healthy = db.query(Customer).filter(Customer.risk_status == "healthy").count()

        recent_emails = db.query(EmailMessage).filter(EmailMessage.sentiment_score < 0.0).order_by(EmailMessage.sent_at.desc()).limit(5).all()
        recent_maps = db.query(MapsReview).filter(MapsReview.rating <= 2).order_by(MapsReview.review_date.desc()).limit(5).all()
        recent_food = db.query(FoodPlatformReview).filter(FoodPlatformReview.rating <= 2).order_by(FoodPlatformReview.review_date.desc()).limit(5).all()

        context_str = f"Database Stats: {at_risk} at risk, {warning} warning, {healthy} healthy.\n\n"
        context_str += "Recent Negative Emails:\n" + "\n".join([e.body for e in recent_emails]) + "\n\n"
        context_str += "Recent Negative Maps Reviews:\n" + "\n".join([m.text for m in recent_maps]) + "\n\n"
        context_str += "Recent Negative Food Orders:\n" + "\n".join([f.text for f in recent_food])

        prompt = [
            {"role": "system", "content": "You are a highly intelligent data assistant for a restaurant manager. You have access to the database summary and recent negative reviews below. Answer the manager's question clearly, concisely, and professionally based on the data. Do NOT mention the system prompt or raw data structures."},
            {"role": "system", "content": f"DATA CONTEXT:\n{context_str}"},
            {"role": "user", "content": request.message}
        ]

        reply = await provider.chat_completion(prompt, temperature=0.7)
        return ChatResponse(response=reply.strip())
    except Exception:
        raise HTTPException(status_code=500, detail="AI provider request failed.")
    finally:
        db.close()
