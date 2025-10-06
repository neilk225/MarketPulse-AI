from contextlib import asynccontextmanager

from fastapi import FastAPI

from .routes import sentiment
from .services.sentiment import finnhub_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        await finnhub_client.close()


app = FastAPI(title="MarketPulse AI API", lifespan=lifespan)
app.include_router(sentiment.router, prefix="/api")


@app.get("/health")
def health_check() -> dict[str, str]:
    """Simple health endpoint for readiness checks."""
    return {"status": "ok"}
