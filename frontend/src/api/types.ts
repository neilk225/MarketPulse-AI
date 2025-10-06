export interface ScoredArticle {
  title: string;
  description?: string | null;
  url: string;
  source?: string | null;
  published_at?: string | null;
  sentiment_label: string;
  sentiment_score: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentSnapshot {
  as_of: string;
  overall_label: string;
  average_score: number;
  breakdown: SentimentBreakdown;
  articles: ScoredArticle[];
}
