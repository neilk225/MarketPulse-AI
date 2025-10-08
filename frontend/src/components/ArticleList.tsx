import { Card, CardContent, CardHeader, Link, Stack, Typography, Chip, Box } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ScoredArticle } from '../api/types';

dayjs.extend(relativeTime);

type ArticleListProps = {
  articles: ScoredArticle[];
};

const SENTIMENT_BADGE: Record<string, { label: string; color: string; background: string }> = {
  positive: {
    label: 'Bullish',
    color: '#22c55e',
    background: 'rgba(34,197,94,0.16)',
  },
  neutral: {
    label: 'Neutral',
    color: '#facc15',
    background: 'rgba(250,204,21,0.18)',
  },
  negative: {
    label: 'Bearish',
    color: '#f97316',
    background: 'rgba(249,115,22,0.2)',
  },
};

const CARD_PADDING = { xs: 1.5, sm: 2.5 };
const HIGHLIGHT_BORDER = '1px solid rgba(148,163,184,0.12)';

function formatMeta(article: ScoredArticle) {
  const meta: string[] = [];
  if (article.source) meta.push(article.source);
  if (article.published_at) meta.push(dayjs(article.published_at).fromNow());
  return meta.join(' | ');
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Latest Headlines"
        subheader={articles.length ? `${articles.length} curated stories` : 'No headlines yet'}
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Stack spacing={3.5}>
          {articles.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nothing to show right now. Adjust the filter or refresh to fetch new coverage.
            </Typography>
          )}

          {articles.map((article) => {
            const sentimentKey = article.sentiment_label.toLowerCase();
            const badge = SENTIMENT_BADGE[sentimentKey] ?? SENTIMENT_BADGE.neutral;
            const confidence = Math.round(article.sentiment_score * 100);

            return (
              <Box
                key={article.url}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.4,
                  padding: CARD_PADDING,
                  borderRadius: 3,
                  backgroundColor: 'rgba(15,23,42,0.55)',
                  border: HIGHLIGHT_BORDER,
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener"
                    variant="h6"
                    underline="hover"
                    sx={{ flex: 1, pr: { sm: 1.5 } }}
                  >
                    {article.title}
                  </Link>
                  <Chip
                    label={`${badge.label} | ${confidence}%`}
                    sx={{
                      bgcolor: badge.background,
                      color: badge.color,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      borderRadius: 999,
                      px: 1.5,
                      py: 0.5,
                    }}
                  />
                </Stack>

                {article.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ pr: { sm: 1.5 } }}>
                    {article.description}
                  </Typography>
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.8, sm: 2 }} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {formatMeta(article)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', sm: 'inline-block' } }}>
                    Confidence {confidence}%
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
