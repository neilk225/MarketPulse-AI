import { Card, CardContent, Stack, Typography, Chip, Box, LinearProgress } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { SentimentSnapshot } from '../api/types';

dayjs.extend(relativeTime);

type SentimentSummaryProps = {
  data: SentimentSnapshot;
};

type SentimentDescriptor = {
  label: string;
  chipColor: string;
  accent: string;
  copy: string;
};

const SENTIMENT_DESCRIPTORS: Array<{ min: number; max: number; descriptor: SentimentDescriptor }> = [
  {
    min: Number.NEGATIVE_INFINITY,
    max: -0.4,
    descriptor: {
      label: 'Strongly Negative Bias',
      chipColor: '#ef4444',
      accent: 'rgba(239,68,68,0.22)',
      copy: 'Decisively bearish tone with risk-off headlines dominating coverage.',
    },
  },
  {
    min: -0.4,
    max: -0.15,
    descriptor: {
      label: 'Negative Bias',
      chipColor: '#f97316',
      accent: 'rgba(249,115,22,0.18)',
      copy: 'Bearish undertone is showing across the latest reporting.',
    },
  },
  {
    min: -0.15,
    max: -0.025,
    descriptor: {
      label: 'Slightly Negative Bias',
      chipColor: '#f59e0b',
      accent: 'rgba(245,158,11,0.18)',
      copy: 'Mildly bearish sentiment with a modest tilt toward caution.',
    },
  },
  {
    min: -0.025,
    max: 0.025,
    descriptor: {
      label: 'Neutral Bias',
      chipColor: '#facc15',
      accent: 'rgba(250,204,21,0.22)',
      copy: 'Balanced tone with bullish and bearish narratives offsetting each other.',
    },
  },
  {
    min: 0.025,
    max: 0.15,
    descriptor: {
      label: 'Slightly Positive Bias',
      chipColor: '#34d399',
      accent: 'rgba(52,211,153,0.18)',
      copy: 'Subtle bullish lean emerging in the recent headlines.',
    },
  },
  {
    min: 0.15,
    max: 0.4,
    descriptor: {
      label: 'Positive Bias',
      chipColor: '#22c55e',
      accent: 'rgba(34,197,94,0.2)',
      copy: 'Constructive sentiment with risk-on narratives gaining traction.',
    },
  },
  {
    min: 0.4,
    max: Number.POSITIVE_INFINITY,
    descriptor: {
      label: 'Strongly Positive Bias',
      chipColor: '#16a34a',
      accent: 'rgba(22,163,74,0.22)',
      copy: 'Decisively bullish momentum fueled by upbeat coverage.',
    },
  },
];

const SUMMARY_SEGMENTS = [
  { label: 'Positive', key: 'positive', color: '#38bdf8' },
  { label: 'Neutral', key: 'neutral', color: '#fbbf24' },
  { label: 'Negative', key: 'negative', color: '#f97316' },
] as const;

function resolveDescriptor(score: number): SentimentDescriptor {
  const match = SENTIMENT_DESCRIPTORS.find(({ min, max }) => score >= min && score < max);
  return match?.descriptor ?? SENTIMENT_DESCRIPTORS[SENTIMENT_DESCRIPTORS.length - 1].descriptor;
}

export function SentimentSummary({ data }: SentimentSummaryProps) {
  const descriptor = resolveDescriptor(data.average_score);
  const sentimentScore = data.average_score.toFixed(2);
  const segments = SUMMARY_SEGMENTS.map((segment) => ({
    ...segment,
    value: data.breakdown[segment.key],
  }));
  const totalArticles = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <Card>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Market Sentiment Overview
          </Typography>
          <Chip
            label={descriptor.label}
            sx={{
              bgcolor: descriptor.accent,
              color: descriptor.chipColor,
              fontWeight: 600,
              letterSpacing: '0.04em',
              borderRadius: 99,
            }}
          />
        </Stack>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
          {descriptor.copy}
        </Typography>

        <Box>
          <Stack direction="row" alignItems="baseline" spacing={1.2} sx={{ mb: 0.5 }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {sentimentScore}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              sentiment score
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Score derived from aggregated article-level predictions across the most recent headlines.
          </Typography>
        </Box>

        <Stack spacing={2.2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Sentiment spectrum
          </Typography>
          <Stack spacing={2}>
            {segments.map((segment) => {
              const percent = totalArticles ? Math.round((segment.value / totalArticles) * 100) : 0;
              return (
                <Stack key={segment.label} spacing={0.75}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: segment.color,
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {segment.label}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {segment.value} {segment.value === 1 ? 'article' : 'articles'} • {percent}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={totalArticles ? (segment.value / totalArticles) * 100 : 0}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: 'rgba(148,163,184,0.15)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        backgroundColor: segment.color,
                      },
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Last updated {dayjs(data.as_of).fromNow()} | {dayjs(data.as_of).format('MMM D, YYYY h:mm A')} UTC
        </Typography>
      </CardContent>
    </Card>
  );
}
