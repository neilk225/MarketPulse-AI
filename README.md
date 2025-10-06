# MarketPulse AI

MarketPulse AI is a resume-ready full-stack project that analyzes the latest stock and crypto headlines in real time. A FastAPI backend pulls breaking stories from the Finnhub News API, scores each headline with a financial-domain language model, and exposes a REST endpoint. The React dashboard visualizes aggregate sentiment, highlights the tone distribution, and surfaces the top headlines with manual refresh controls.

## Features
- Live sentiment snapshot generated on-demand with a single Refresh click.
- Optional Finnhub symbol filter (e.g., `AAPL`, `TSLA`, `BTC`, `BINANCE:BTCUSDT`) to tailor the news feed.
- FinBERT-tone (finetuned BERT on Reuters financial news) produces positive/neutral/negative classifications.
- Sentiment breakdown chart and confidence summary for at-a-glance insight.
- Curated headline list with labels, descriptions, and source metadata.

## Tech Stack
- **Frontend:** React (Vite + TypeScript), Material UI, React Query, Recharts.
- **Backend:** FastAPI, HTTPX, Transformers (FinBERT-tone), Torch.
- **Infra & Tooling:** Axios, Day.js, Pydantic Settings.

## Getting Started
### Prerequisites
- Node.js 18+
- Python 3.11+
- Finnhub account and API key (free tier supports 60 requests/min)

### Backend Setup
1. Create a Python virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # macOS/Linux
   pip install -r requirements.txt
   ```
2. Populate `backend/.env` (copy from `shared/.env.example`) with your `FINNHUB_API_KEY`. Optionally override `SENTIMENT_MODEL_NAME` to try other Hugging Face models.
3. Run the API locally:
   ```bash
   uvicorn app.main:app --reload
   ```
   The first request downloads the FinBERT-tone weights (~400 MB); subsequent refreshes are much faster.

### Frontend Setup
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
   > PowerShell note: if script execution is restricted, prefix commands with `cmd /c` (e.g., `cmd /c npm install`).
2. Ensure `frontend/.env` points `VITE_API_BASE_URL` to the running backend (defaults to `http://localhost:8000/api`).
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Usage
- Hit the Refresh button to trigger a fresh Finnhub fetch and sentiment analysis.
- Use the filter input with a valid Finnhub symbol (US equities like `AAPL`, or crypto pairs such as `BTC`, `ETH`, `BINANCE:SOLUSDT`). Clearing the field reverts to general market headlines.
- The dashboard shows the overall label, confidence, distribution chart, and detailed headline list with sentiment tags.

## Future Enhancements
- Persist historical snapshots for trend lines or intraday comparisons.
- Add caching or rate limiting safeguards for longer demos.
- Expand data sources (e.g., Reddit, Twitter) or add portfolio watchlists.

## Notes
- Finnhub free tier is generous, but rapid repeated refreshes can hit the 60 calls/min limit—pace manual refreshes during demos.
- FinBERT-tone is lighter than RoBERTa-large but still transformer-based; ensure your machine has enough RAM/CPU for the ~400 MB download.
