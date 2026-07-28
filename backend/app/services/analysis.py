import json
import re
from sqlalchemy.orm import Session
from datetime import datetime

from app.providers import get_provider_manager
from app.models import Customer, RiskScore, EmailMessage, MapsReview, FoodPlatformReview

class AnalysisService:
    @staticmethod
    def _parse_json(text: str) -> dict:
        if not text:
            return {}
        try:
            match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
            if match:
                return json.loads(match.group(1))
            return json.loads(text)
        except Exception:
            try:
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
            except Exception:
                pass
            return {}

    @classmethod
    async def analyze_email(cls, email_text: str, direction: str) -> dict:
        provider = get_provider_manager().get_provider()
        if not provider:
            return {
                "sentiment_score": 0.5,
                "tone_formality": 0.5,
                "tone_length_trend": 0.5,
                "reason": "No AI provider connected. Default analysis."
            }
            
        prompt = f"""Analyze the following {direction} email for customer churn risk.
Return a JSON object with:
- "sentiment_score": float between -1.0 (very negative) and 1.0 (very positive)
- "tone_formality": float between 0.0 (casual) and 1.0 (very formal/cold)
- "tone_length_trend": float between 0.0 (short/curt) and 1.0 (detailed/engaged)
- "reason": brief string explaining the analysis

Email text:
{email_text}
"""
        messages = [
            {"role": "system", "content": "You are a customer sentiment analysis AI. You only reply with valid JSON."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response_text = await provider.chat_completion(messages, temperature=0.3)
            data = cls._parse_json(response_text)
            return {
                "sentiment_score": float(data.get("sentiment_score") or 0.0),
                "tone_formality": float(data.get("tone_formality") or 0.5),
                "tone_length_trend": float(data.get("tone_length_trend") or 0.5),
                "reason": data.get("reason", "Analyzed")
            }
        except Exception:
            return {"sentiment_score": 0.0, "tone_formality": 0.5, "tone_length_trend": 0.5, "reason": "Analysis failed"}

    @classmethod
    async def analyze_review(cls, review_text: str, rating: float) -> dict:
        provider = get_provider_manager().get_provider()
        if not provider:
            sentiment = ((rating - 1) / 4.0) * 2.0 - 1.0
            return {"sentiment_score": round(sentiment, 3), "reason": "No AI provider - score derived from star rating."}
            
        prompt = f"""Analyze the following review (Rating: {rating}/5) for customer satisfaction.
Return a JSON object with:
- "sentiment_score": float between -1.0 (very negative) and 1.0 (very positive)
- "reason": brief string explaining the sentiment

Review text:
{review_text}
"""
        messages = [
            {"role": "system", "content": "You are a review analysis AI. You only reply with valid JSON."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response_text = await provider.chat_completion(messages, temperature=0.3)
            data = cls._parse_json(response_text)
            return {
                "sentiment_score": float(data.get("sentiment_score") or (rating - 3)/2.0),
                "reason": data.get("reason", "Analyzed")
            }
        except Exception:
            return {"sentiment_score": 0.0, "reason": "Analysis failed"}

    @classmethod
    def calculate_customer_risk_sync(cls, customer_id: int, db_session: Session) -> dict:
        customer = db_session.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return None

        emails = db_session.query(EmailMessage).filter(EmailMessage.customer_id == customer_id, EmailMessage.sentiment_score.isnot(None)).order_by(EmailMessage.sent_at.desc()).limit(10).all()
        maps_reviews = db_session.query(MapsReview).filter(MapsReview.customer_id == customer_id, MapsReview.sentiment_score.isnot(None)).order_by(MapsReview.review_date.desc()).limit(5).all()
        food_reviews = db_session.query(FoodPlatformReview).filter(FoodPlatformReview.customer_id == customer_id, FoodPlatformReview.sentiment_score.isnot(None)).order_by(FoodPlatformReview.review_date.desc()).limit(5).all()

        email_score = 1.0
        if emails:
            avg_sent = sum(e.sentiment_score for e in emails) / len(emails)
            email_score = (avg_sent + 1.0) / 2.0

        maps_score = 1.0
        if maps_reviews:
            avg_sent = sum(r.sentiment_score for r in maps_reviews) / len(maps_reviews)
            maps_score = (avg_sent + 1.0) / 2.0

        food_score = 1.0
        if food_reviews:
            avg_sent = sum(r.sentiment_score for r in food_reviews) / len(food_reviews)
            food_score = (avg_sent + 1.0) / 2.0

        total_weight = 0.0
        weighted_score = 0.0
        
        if emails:
            weighted_score += email_score * 0.4
            total_weight += 0.4
        if maps_reviews:
            weighted_score += maps_score * 0.3
            total_weight += 0.3
        if food_reviews:
            weighted_score += food_score * 0.3
            total_weight += 0.3

        if total_weight == 0:
            final_score = 1.0
        else:
            final_score = weighted_score / total_weight

        if final_score < 0.4:
            status = 'at_risk'
        elif final_score < 0.7:
            status = 'warning'
        else:
            status = 'healthy'

        recent_scores = db_session.query(RiskScore).filter(RiskScore.customer_id == customer_id).order_by(RiskScore.calculated_at.desc()).limit(3).all()
        trend = "stable"
        if len(recent_scores) >= 2:
            diff = final_score - recent_scores[0].score
            if diff < -0.1:
                trend = "declining"
            elif diff > 0.1:
                trend = "improving"

        reason = f"Based on {len(emails)} emails, {len(maps_reviews)} maps reviews, {len(food_reviews)} food platform reviews. Trend is {trend}."

        return {
            "score": final_score,
            "email_score": email_score if emails else None,
            "maps_score": maps_score if maps_reviews else None,
            "food_score": food_score if food_reviews else None,
            "reason": reason,
            "status": status
        }

    @classmethod
    async def score_unanalyzed(cls, db_session: Session):
        provider = get_provider_manager().get_provider()
        if not provider:
            return

        un_emails = db_session.query(EmailMessage).filter(EmailMessage.sentiment_score == None).all()
        for e in un_emails:
            res = await cls.analyze_email(e.body, e.direction)
            e.sentiment_score = res.get("sentiment_score", 0.0)
            e.tone_formality = res.get("tone_formality", 0.5)
            e.tone_length_trend = res.get("tone_length_trend", 0.5)
            e.analysis_reason = res.get("reason", "Analyzed")
            e.analyzed_at = datetime.utcnow()
            db_session.commit()

        un_maps = db_session.query(MapsReview).filter(MapsReview.sentiment_score == None).all()
        for m in un_maps:
            res = await cls.analyze_review(m.text, m.rating)
            m.sentiment_score = res.get("sentiment_score", 0.0)
            m.analysis_reason = res.get("reason", "Analyzed")
            m.analyzed_at = datetime.utcnow()
            db_session.commit()

        un_food = db_session.query(FoodPlatformReview).filter(FoodPlatformReview.sentiment_score == None).all()
        for f in un_food:
            res = await cls.analyze_review(f.text, f.rating)
            f.sentiment_score = res.get("sentiment_score", 0.0)
            f.analysis_reason = res.get("reason", "Analyzed")
            f.analyzed_at = datetime.utcnow()
            db_session.commit()

    @classmethod
    def calculate_all_risks_sync(cls, db_session: Session) -> list:
        customers = db_session.query(Customer).all()
        results = []
        for c in customers:
            risk_data = cls.calculate_customer_risk_sync(c.id, db_session)
            if risk_data:
                c.current_risk_score = risk_data['score']
                c.risk_status = risk_data['status']
                c.risk_reason = risk_data['reason']
                
                new_score = RiskScore(
                    customer_id=c.id,
                    score=risk_data['score'],
                    email_score=risk_data['email_score'],
                    maps_score=risk_data['maps_score'],
                    food_score=risk_data['food_score'],
                    reason=risk_data['reason']
                )
                db_session.add(new_score)
                results.append({"id": c.id, "score": risk_data['score']})
        
        db_session.commit()
        return results

    @classmethod
    async def calculate_customer_risk(cls, customer_id: int, db_session: Session) -> dict:
        return cls.calculate_customer_risk_sync(customer_id, db_session)

    @classmethod
    async def analyze_all_customers(cls, db_session: Session) -> list:
        provider = get_provider_manager().get_provider()
        
        if not provider:
            return cls.calculate_all_risks_sync(db_session)
        
        customers = db_session.query(Customer).order_by(Customer.id.asc()).limit(5).all()
        customer_ids = [c.id for c in customers]
        
        for cid in customer_ids:
            for e in db_session.query(EmailMessage).filter(EmailMessage.customer_id == cid).all():
                e.sentiment_score = None
                e.analysis_reason = "Awaiting AI analysis"
                e.analyzed_at = None
            for m in db_session.query(MapsReview).filter(MapsReview.customer_id == cid).all():
                m.sentiment_score = None
                m.analysis_reason = "Awaiting AI analysis"
                m.analyzed_at = None
            for f in db_session.query(FoodPlatformReview).filter(FoodPlatformReview.customer_id == cid).all():
                f.sentiment_score = None
                f.analysis_reason = "Awaiting AI analysis"
                f.analyzed_at = None
        
        db_session.commit()
        await cls.score_unanalyzed(db_session)
        return cls.calculate_all_risks_sync(db_session)
