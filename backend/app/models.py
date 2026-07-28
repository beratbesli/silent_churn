from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=True)
    first_interaction = Column(DateTime, default=datetime.utcnow)
    last_interaction = Column(DateTime, default=datetime.utcnow)
    current_risk_score = Column(Float, default=1.0)
    risk_status = Column(String, default='healthy')
    risk_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    emails = relationship("EmailMessage", back_populates="customer")
    food_reviews = relationship("FoodPlatformReview", back_populates="customer")
    maps_reviews = relationship("MapsReview", back_populates="customer")
    risk_history = relationship("RiskScore", back_populates="customer", order_by="RiskScore.calculated_at.asc()")


class EmailMessage(Base):
    __tablename__ = "email_messages"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    direction = Column(String)
    subject = Column(String)
    body = Column(Text)
    sent_at = Column(DateTime, default=datetime.utcnow)
    sentiment_score = Column(Float, nullable=True)
    tone_formality = Column(Float, nullable=True)
    tone_length_trend = Column(Float, nullable=True)
    analysis_reason = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="emails")


class MapsReview(Base):
    __tablename__ = "maps_reviews"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    place_id = Column(String, index=True)
    author_name = Column(String)
    rating = Column(Integer)
    text = Column(Text)
    review_date = Column(DateTime)
    sentiment_score = Column(Float, nullable=True)
    analysis_reason = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, nullable=True)
    is_synthetic = Column(Boolean, default=True)

    customer = relationship("Customer", back_populates="maps_reviews")


class FoodPlatformReview(Base):
    __tablename__ = "food_platform_reviews"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    platform_name = Column(String)
    rating = Column(Float)
    text = Column(Text)
    review_date = Column(DateTime)
    order_items = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    analysis_reason = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="food_reviews")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    score = Column(Float)
    email_score = Column(Float, nullable=True)
    maps_score = Column(Float, nullable=True)
    food_score = Column(Float, nullable=True)
    reason = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="risk_history")
