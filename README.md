# MarketPulse AI

MarketPulse AI is a React based dashboard that analyzes the latest stock and crypto headlines in real time. A FastAPI backend pulls articles by calling the Finnhub News API and scores each headline using a language model. The dashboard visualizes aggregate sentiment, highlights the tone distribution, and surfaces the top headlines with manual refresh controls.

## Features
- Real-time refresh that re-scores the latest Finnhub headlines on demand
- Symbol filtering for equities and major cryptocurrencies
- Confidence-gated financial sentiment model for cleaner labels
- Headline feed with tone badges, article summaries, and source metadata
  
## Tech Stack
- **Frontend:** React + Vite (TypeScript), Material UI, React Query
- **Backend:** FastAPI, HTTPX, Transformers, Torch
- **Tooling:** Pydantic Settings, Axios, Day.js

## Setup

### 1. Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env` with:
```env
FINNHUB_API_KEY=your_key_here
SENTIMENT_MODEL_NAME=yiyanghkust/finbert-tone
SENTIMENT_CONFIDENCE_THRESHOLD=0.6
```
Then launch the API:
```bash
uvicorn app.main:app --reload
```
The first request downloads model weights (~400 MB).

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Set `VITE_API_BASE_URL` in `frontend/.env` if the backend runs on a different origin (defaults to `http://localhost:8000/api`).

## Usage
- Click **Refresh** to pull fresh headlines and recompute sentiment.
- Filter with Finnhub symbols (examples: `AAPL`, `TSLA`, `BTC`, `BINANCE:ETHUSDT`). Clear the field to revert to general news.
- Review the overview card for the bias descriptor, model score, and sentiment spectrum; inspect the headline list for detailed tone and confidence.
