from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class TimelineEntry(BaseModel):
    calculated_at: datetime
    score: float
    reason: Optional[str] = None
    email_score: Optional[float] = None
    maps_score: Optional[float] = None
    food_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class CustomerSummary(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    current_risk_score: float
    risk_status: str
    risk_reason: Optional[str] = None
    first_interaction: Optional[datetime] = None
    last_interaction: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EmailMessageSchema(BaseModel):
    id: int
    direction: str
    subject: str
    body: str
    sent_at: datetime
    sentiment_score: Optional[float] = None
    tone_formality: Optional[float] = None
    tone_length_trend: Optional[float] = None
    analysis_reason: Optional[str] = None
    analyzed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MapsReviewSchema(BaseModel):
    id: int
    place_id: Optional[str] = None
    author_name: str
    rating: int
    text: str
    review_date: datetime
    sentiment_score: Optional[float] = None
    analysis_reason: Optional[str] = None
    analyzed_at: Optional[datetime] = None
    is_synthetic: bool = True

    model_config = ConfigDict(from_attributes=True)


class FoodPlatformReviewSchema(BaseModel):
    id: int
    platform_name: str
    rating: float
    text: str
    review_date: datetime
    order_items: Optional[str] = None
    sentiment_score: Optional[float] = None
    analysis_reason: Optional[str] = None
    analyzed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RiskScoreSchema(BaseModel):
    id: int
    score: float
    email_score: Optional[float] = None
    maps_score: Optional[float] = None
    food_score: Optional[float] = None
    reason: Optional[str] = None
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerDetail(CustomerSummary):
    first_interaction: Optional[datetime] = None
    emails: List[EmailMessageSchema] = []
    maps_reviews: List[MapsReviewSchema] = []
    food_reviews: List[FoodPlatformReviewSchema] = []
    risk_history: List[RiskScoreSchema] = []

    model_config = ConfigDict(from_attributes=True)


class ProviderConfig(BaseModel):
    provider: str
    is_connected: bool
    model_name: Optional[str] = None


class ProviderConnectRequest(BaseModel):
    provider: str
    api_key: Optional[str] = None
    model_id: Optional[str] = None


class ProviderConnectResponse(BaseModel):
    success: bool
    message: str
    provider: str


class DashboardStats(BaseModel):
    total_customers: int
    healthy_customers: int
    warning_customers: int
    at_risk_customers: int
    average_risk_score: float

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class DraftResponse(BaseModel):
    draft: str

