from pydantic import BaseModel, HttpUrl
from datetime import datetime


class Article(BaseModel):
    title: str
    description: str | None = None
    url: HttpUrl
    source: str | None = None
    published_at: datetime | None = None


class ScoredArticle(Article):
    sentiment_label: str
    sentiment_score: float


class SentimentBreakdown(BaseModel):
    positive: int
    neutral: int
    negative: int


class SentimentSnapshot(BaseModel):
    as_of: datetime
    overall_label: str
    average_score: float
    breakdown: SentimentBreakdown
    articles: list[ScoredArticle]
