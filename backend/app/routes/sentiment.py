from fastapi import APIRouter, Depends, HTTPException, Query

from ..models.sentiment import SentimentSnapshot
from ..services.sentiment import SentimentService, sentiment_service

router = APIRouter(prefix="/sentiment", tags=["sentiment"])


def get_service() -> SentimentService:
    return sentiment_service


@router.get("", response_model=SentimentSnapshot)
async def get_sentiment_snapshot(
    symbol: str | None = Query(
        default=None,
        description="Optional Finnhub symbol (e.g. AAPL, TSLA, BINANCE:BTCUSDT) to tailor headlines.",
    ),
    service: SentimentService = Depends(get_service),
) -> SentimentSnapshot:
    try:
        return await service.get_snapshot(query=symbol)
    except Exception as exc:  # pragma: no cover - surfaced to FastAPI for proper logging
        raise HTTPException(status_code=502, detail="Failed to fetch sentiment data") from exc
