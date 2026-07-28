from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from sqlalchemy import func

from app.database import get_db, SessionLocal
from app.models import Customer, RiskScore, EmailMessage, MapsReview, FoodPlatformReview
from app.schemas import CustomerSummary, CustomerDetail, TimelineEntry, DashboardStats, DraftResponse
from app.services.analysis import AnalysisService
from app.services.synthetic_data import SyntheticDataService
from app.providers import get_provider_manager

router = APIRouter(tags=["customers"])


@router.get("/customers", response_model=List[CustomerSummary])
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).order_by(Customer.current_risk_score.asc()).all()
    return customers


@router.get("/customers/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(Customer).count()
    healthy = db.query(Customer).filter(Customer.risk_status == 'healthy').count()
    warning = db.query(Customer).filter(Customer.risk_status == 'warning').count()
    at_risk = db.query(Customer).filter(Customer.risk_status == 'at_risk').count()

    avg_risk = 1.0
    if total > 0:
        avg_risk = db.query(func.avg(Customer.current_risk_score)).scalar() or 1.0

    return DashboardStats(
        total_customers=total,
        healthy_customers=healthy,
        warning_customers=warning,
        at_risk_customers=at_risk,
        average_risk_score=round(avg_risk, 3)
    )


@router.get("/customers/{id}", response_model=CustomerDetail)
def get_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.get("/customers/{id}/timeline", response_model=List[TimelineEntry])
def get_customer_timeline(id: int, db: Session = Depends(get_db)):
    scores = db.query(RiskScore).filter(
        RiskScore.customer_id == id
    ).order_by(RiskScore.calculated_at.asc()).all()
    return scores


@router.post("/refresh-analysis")
async def refresh_analysis(mode: str = "demo"):
    db = SessionLocal()
    try:
        provider = get_provider_manager().get_provider()
        
        if not provider:
            results = AnalysisService.calculate_all_risks_sync(db)
            return {"message": "Analysis complete", "analyzed": len(results)}
        
        customers = []
        if mode == "all":
            customers = db.query(Customer).all()
        else:
            healthy_c = db.query(Customer).filter(Customer.risk_status == 'healthy').first()
            warning_c = db.query(Customer).filter(Customer.risk_status == 'warning').first()
            risk_c = db.query(Customer).filter(Customer.risk_status == 'at_risk').first()
            if healthy_c: customers.append(healthy_c)
            if warning_c: customers.append(warning_c)
            if risk_c: customers.append(risk_c)

        for c in customers:
            for e in db.query(EmailMessage).filter(EmailMessage.customer_id == c.id).all():
                e.sentiment_score = None
                e.analysis_reason = "Awaiting AI"
                e.analyzed_at = None
            for m in db.query(MapsReview).filter(MapsReview.customer_id == c.id).all():
                m.sentiment_score = None
                m.analysis_reason = "Awaiting AI"
                m.analyzed_at = None
            for f in db.query(FoodPlatformReview).filter(FoodPlatformReview.customer_id == c.id).all():
                f.sentiment_score = None
                f.analysis_reason = "Awaiting AI"
                f.analyzed_at = None
        db.commit()
        
        un_emails = db.query(EmailMessage).filter(EmailMessage.sentiment_score == None).all()
        for e in un_emails:
            try:
                res = await AnalysisService.analyze_email(e.body, e.direction)
                e.sentiment_score = float(res.get("sentiment_score") or 0.0)
                e.tone_formality = float(res.get("tone_formality") or 0.5)
                e.tone_length_trend = float(res.get("tone_length_trend") or 0.5)
                e.analysis_reason = res.get("reason", "AI analyzed")
                e.analyzed_at = datetime.utcnow()
                db.commit()
            except Exception:
                pass
        
        un_maps = db.query(MapsReview).filter(MapsReview.sentiment_score == None).all()
        for m in un_maps:
            try:
                res = await AnalysisService.analyze_review(m.text, m.rating)
                m.sentiment_score = float(res.get("sentiment_score") or 0.0)
                m.analysis_reason = res.get("reason", "AI analyzed")
                m.analyzed_at = datetime.utcnow()
                db.commit()
            except Exception:
                pass
        
        un_food = db.query(FoodPlatformReview).filter(FoodPlatformReview.sentiment_score == None).all()
        for f in un_food:
            try:
                res = await AnalysisService.analyze_review(f.text, f.rating)
                f.sentiment_score = float(res.get("sentiment_score") or 0.0)
                f.analysis_reason = res.get("reason", "AI analyzed")
                f.analyzed_at = datetime.utcnow()
                db.commit()
            except Exception:
                pass
        
        results = AnalysisService.calculate_all_risks_sync(db)
        return {"message": "Analysis complete", "analyzed": len(results)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()


@router.post("/generate-data")
def generate_data():
    db = SessionLocal()
    try:
        SyntheticDataService.generate_all_data(db)
        return {"message": "Synthetic data generated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()


@router.post("/customers/{id}/draft-reply", response_model=DraftResponse)
async def draft_reply(id: int):
    db = SessionLocal()
    try:
        customer = db.query(Customer).filter(Customer.id == id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        provider = get_provider_manager().get_provider()
        recent_emails = db.query(EmailMessage).filter(EmailMessage.customer_id == id, EmailMessage.direction == "inbound").order_by(EmailMessage.sent_at.desc()).limit(3).all()

        if not provider:
            mock_draft = f"Dear {customer.name},\n\nI am writing to sincerely apologize for the recent negative experience you had with us. We deeply value your feedback and I want to assure you that we are taking your comments seriously.\n\nTo make it up to you, please accept this 20% discount code (WINBACK20) on your next order. We hope you will give us another chance to provide you with the exceptional service you deserve.\n\nBest regards,\nThe Management Team"
            return DraftResponse(draft=mock_draft)

        recent_maps = db.query(MapsReview).filter(MapsReview.customer_id == id).order_by(MapsReview.review_date.desc()).limit(3).all()
        recent_food = db.query(FoodPlatformReview).filter(FoodPlatformReview.customer_id == id).order_by(FoodPlatformReview.review_date.desc()).limit(3).all()

        context_texts = []
        for e in recent_emails:
            context_texts.append(f"Email: {e.body}")
        for m in recent_maps:
            context_texts.append(f"Maps Review: {m.text}")
        for f in recent_food:
            context_texts.append(f"Food Order Review: {f.text}")

        context_str = "\n".join(context_texts)

        prompt = [
            {"role": "system", "content": "You are an expert customer success manager for a restaurant. Your goal is to win back a customer who recently had a bad experience."},
            {"role": "user", "content": f"Customer name is {customer.name}.\n\nRecent negative interactions:\n{context_str}\n\nDraft a polite, empathetic apology email to this customer. Address their specific complaints if any. Offer them a 20% discount code (WINBACK20) to give us another chance. Do not include placeholders like [Your Name]. Just write the final email body as plain text."}
        ]

        try:
            reply = await provider.chat_completion(prompt, temperature=0.7)
            return DraftResponse(draft=reply.strip())
        except Exception:
            mock_draft = f"Dear {customer.name},\n\nI am writing to sincerely apologize for the recent negative experience you had with us. We deeply value your feedback and I want to assure you that we are taking your comments seriously.\n\nTo make it up to you, please accept this 20% discount code (WINBACK20) on your next order. We hope you will give us another chance to provide you with the exceptional service you deserve.\n\nBest regards,\nThe Management Team"
            return DraftResponse(draft=mock_draft)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()
