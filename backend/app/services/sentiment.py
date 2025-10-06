import asyncio
from collections import Counter
from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Any, Iterable

import httpx
from transformers import pipeline

from ..core.config import settings
from ..models.sentiment import Article, ScoredArticle, SentimentBreakdown, SentimentSnapshot


_LABEL_NORMALIZATION = {
    "positive": "positive",
    "neutral": "neutral",
    "negative": "negative",
    "label_0": "negative",
    "label_1": "neutral",
    "label_2": "positive",
}


class FinnhubClient:
    BASE_URL = "https://finnhub.io/api/v1"
    _CRYPTO_SYMBOL_MAP = {
        "BTC": "BINANCE:BTCUSDT",
        "ETH": "BINANCE:ETHUSDT",
        "SOL": "BINANCE:SOLUSDT",
        "ADA": "BINANCE:ADAUSDT",
    }

    def __init__(self, api_key: str) -> None:
        self._api_key = api_key
        self._client = httpx.AsyncClient(base_url=self.BASE_URL, timeout=10.0)

    async def fetch_market_news(self, symbol: str | None = None, limit: int = 20) -> list[Article]:
        if symbol:
            normalized_symbol = self._normalize_symbol(symbol)
            if self._is_crypto_symbol(normalized_symbol):
                data = await self._safe_request(
                    "/crypto-news",
                    {
                        "symbol": normalized_symbol,
                        "token": self._api_key,
                    },
                )
                if not data:
                    data = await self._safe_request(
                        "/news",
                        {
                            "category": "crypto",
                            "token": self._api_key,
                        },
                    )
                    data = self._filter_related(data, normalized_symbol)
            else:
                today = datetime.utcnow().date()
                start = today - timedelta(days=7)
                data = await self._safe_request(
                    "/company-news",
                    {
                        "symbol": normalized_symbol,
                        "from": start.isoformat(),
                        "to": today.isoformat(),
                        "token": self._api_key,
                    },
                )
                if not data:
                    data = await self._safe_request(
                        "/news",
                        {
                            "category": "general",
                            "token": self._api_key,
                        },
                    )
                    data = self._filter_related(data, normalized_symbol)
        else:
            data = await self._safe_request(
                "/news",
                {
                    "category": "general",
                    "token": self._api_key,
                },
            )

        articles_iter: Iterable[dict[str, Any]] = data[:limit] if isinstance(data, list) else []

        articles: list[Article] = []
        for item in articles_iter:
            title = item.get("headline")
            url = item.get("url")
            if not title or not url:
                continue
            articles.append(
                Article(
                    title=title,
                    description=item.get("summary"),
                    url=url,
                    source=item.get("source"),
                    published_at=self._parse_timestamp(item.get("datetime")),
                )
            )
        return articles

    async def close(self) -> None:
        await self._client.aclose()

    async def _safe_request(self, path: str, params: dict[str, Any]) -> list[dict[str, Any]]:
        try:
            response = await self._client.get(path, params=params)
            response.raise_for_status()
            payload = response.json()
            if isinstance(payload, dict) and payload.get("error"):
                return []
            if not isinstance(payload, list):
                return []
            return payload
        except httpx.HTTPError:
            return []

    def _filter_related(self, items: list[dict[str, Any]], symbol: str) -> list[dict[str, Any]]:
        symbol_upper = symbol.upper()
        filtered: list[dict[str, Any]] = []
        for item in items:
            related = (item.get("related") or "").upper().split(",")
            if symbol_upper in related:
                filtered.append(item)
        return filtered or items

    def _normalize_symbol(self, raw_symbol: str) -> str:
        symbol = raw_symbol.strip().upper()
        return self._CRYPTO_SYMBOL_MAP.get(symbol, symbol)

    @staticmethod
    def _is_crypto_symbol(symbol: str) -> bool:
        return symbol.startswith("BINANCE:") or symbol.startswith("COINBASE:")

    @staticmethod
    def _parse_timestamp(value: Any) -> datetime | None:
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(value, tz=timezone.utc)
        return None


class SentimentPipeline:
    def __init__(self, model_name: str) -> None:
        self._model_name = model_name
        self._classifier: Any | None = None
        self._load_lock = Lock()

    async def _ensure_classifier(self) -> Any:
        if self._classifier is not None:
            return self._classifier

        def load() -> Any:
            with self._load_lock:
                if self._classifier is None:
                    self._classifier = pipeline(
                        task="sentiment-analysis",
                        model=self._model_name,
                        tokenizer=self._model_name,
                        truncation=True,
                    )
                return self._classifier

        return await asyncio.to_thread(load)

    async def score(self, articles: list[Article]) -> list[ScoredArticle]:
        if not articles:
            return []

        classifier = await self._ensure_classifier()
        titles = [article.title for article in articles]
        predictions = await asyncio.to_thread(lambda: classifier(titles))

        scored: list[ScoredArticle] = []
        for article, prediction in zip(articles, predictions):
            label = _LABEL_NORMALIZATION.get(prediction["label"].lower(), "neutral")
            score = float(prediction["score"])
            scored.append(
                ScoredArticle(
                    **article.model_dump(),
                    sentiment_label=label,
                    sentiment_score=score,
                )
            )
        return scored


class SentimentService:
    def __init__(self, news_client: FinnhubClient, analyzer: SentimentPipeline) -> None:
        self._news_client = news_client
        self._analyzer = analyzer

    async def get_snapshot(self, query: str | None = None) -> SentimentSnapshot:
        articles = await self._news_client.fetch_market_news(symbol=query)
        scored = await self._analyzer.score(articles)

        if not scored:
            return SentimentSnapshot(
                as_of=datetime.now(timezone.utc),
                overall_label="neutral",
                average_score=0.0,
                breakdown=SentimentBreakdown(positive=0, neutral=0, negative=0),
                articles=[],
            )

        label_weights = {"positive": 1, "neutral": 0, "negative": -1}
        total_weight = 0.0
        total_articles = 0
        breakdown_counter: Counter[str] = Counter()

        for article in scored:
            label = article.sentiment_label
            breakdown_counter[label] += 1
            total_weight += label_weights.get(label, 0) * article.sentiment_score
            total_articles += 1

        average = total_weight / total_articles if total_articles else 0.0
        overall_label = "positive" if average > 0.05 else "negative" if average < -0.05 else "neutral"

        breakdown = SentimentBreakdown(
            positive=breakdown_counter.get("positive", 0),
            neutral=breakdown_counter.get("neutral", 0),
            negative=breakdown_counter.get("negative", 0),
        )

        return SentimentSnapshot(
            as_of=datetime.now(timezone.utc),
            overall_label=overall_label,
            average_score=average,
            breakdown=breakdown,
            articles=scored,
        )


finnhub_client = FinnhubClient(settings.finnhub_api_key)
analyzer = SentimentPipeline(settings.sentiment_model_name)
sentiment_service = SentimentService(finnhub_client, analyzer)