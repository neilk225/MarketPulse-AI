import { Card, CardContent, CardHeader, Stack, Typography, Box } from '@mui/material';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Tooltip } from 'recharts';
import type { SentimentBreakdown } from '../api/types';

type SentimentChartProps = {
  breakdown: SentimentBreakdown;
};

const COLOR_MAP = {
  positive: '#38bdf8',
  neutral: '#fbbf24',
  negative: '#f97316',
};

export function SentimentBreakdownChart({ breakdown }: SentimentChartProps) {
  const rawData = [
    { key: 'positive', name: 'Positive', value: breakdown.positive, fill: COLOR_MAP.positive },
    { key: 'neutral', name: 'Neutral', value: breakdown.neutral, fill: COLOR_MAP.neutral },
    { key: 'negative', name: 'Negative', value: breakdown.negative, fill: COLOR_MAP.negative },
  ];

  const filtered = rawData.filter((item) => item.value > 0);
  const total = filtered.reduce((sum, item) => sum + item.value, 0);

  const ringThickness = 18;
  const ringGap = 10;
  const maxOuterRadius = 120;

  const rings = filtered.map((item, index) => {
    const outerRadius = maxOuterRadius - index * (ringThickness + ringGap);
    const innerRadius = outerRadius - ringThickness;
    return { ...item, outerRadius, innerRadius };
  });

  const maxDomain = Math.max(...rings.map((item) => item.value), 1);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Sentiment Spectrum"
        subheader={total ? `${total} headlines analyzed` : 'Awaiting fresh headlines'}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ height: { xs: 320, md: 340 }, position: 'relative' }}>
        {total === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
            <Typography variant="body2" color="text.secondary">
              No articles scored yet. Try a different filter or refresh the feed.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={rings}
                cx="50%"
                cy="50%"
                innerRadius={rings.at(-1)?.innerRadius ?? 20}
                outerRadius={maxOuterRadius}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, maxDomain]} tick={false} />
                <Tooltip
                  formatter={(value: number, name: string, entry) => [`${value} articles`, entry?.payload?.name ?? name]}
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                />
                <RadialBar
                  dataKey="value"
                  cornerRadius={ringThickness / 2}
                  background={{ fill: 'rgba(15,23,42,0.55)' }}
                  isAnimationActive={false}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            <Stack
              spacing={0.4}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <Typography variant="overline" color="text.secondary">
                Total articles
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {total}
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 2.5 }}
              sx={{ position: 'absolute', bottom: 8, left: 16, right: 16 }}
            >
              {rings.map((item) => {
                const percent = total ? Math.round((item.value / total) * 100) : 0;
                return (
                  <Stack key={item.key} spacing={0.6} direction="row" alignItems="center" sx={{ flex: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.fill }} />
                    <Stack spacing={0.2}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.value} articles | {percent}%
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
