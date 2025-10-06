import { Card, CardContent, CardHeader, Stack, Typography, Box } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { SentimentBreakdown } from '../api/types';

type SentimentChartProps = {
  breakdown: SentimentBreakdown;
};

const COLOR_MAP = {
  positive: '#38bdf8',
  neutral: '#fbbf24',
  negative: '#f97316',
};

const TRACK_COLOR = 'rgba(148,163,184,0.18)';
const RING_THICKNESS = 24;
const RING_GAP = 12;
const MAX_OUTER_RADIUS = 120;

export function SentimentBreakdownChart({ breakdown }: SentimentChartProps) {
  const rawData = [
    { key: 'positive', name: 'Positive', value: breakdown.positive, fill: COLOR_MAP.positive },
    { key: 'neutral', name: 'Neutral', value: breakdown.neutral, fill: COLOR_MAP.neutral },
    { key: 'negative', name: 'Negative', value: breakdown.negative, fill: COLOR_MAP.negative },
  ];

  const rings = rawData.filter((item) => item.value > 0);
  const total = rings.reduce((sum, item) => sum + item.value, 0);

  const ringGeometry = rings.map((item, index) => {
    const outerRadius = MAX_OUTER_RADIUS - index * (RING_THICKNESS + RING_GAP);
    const innerRadius = outerRadius - RING_THICKNESS;
    return { ...item, outerRadius, innerRadius };
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Sentiment Spectrum"
        subheader={total ? `${total} headlines analyzed` : 'Awaiting fresh headlines'}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ height: { xs: 320, md: 340 }, position: 'relative', display: 'flex', alignItems: 'center' }}>
        {total === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              No articles scored yet. Try a different filter or refresh the feed.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {ringGeometry.map((ring) => {
                  const remainder = Math.max(total - ring.value, 0);
                  const data = [
                    {
                      key: `${ring.key}-value`,
                      value: ring.value,
                      fill: ring.fill,
                      label: ring.name,
                      isPrimary: true,
                    },
                    {
                      key: `${ring.key}-rest`,
                      value: remainder || 0.0001,
                      fill: TRACK_COLOR,
                      label: `${ring.name} remainder`,
                      isPrimary: false,
                    },
                  ];

                  return (
                    <Pie
                      key={ring.key}
                      data={data}
                      dataKey="value"
                      innerRadius={ring.innerRadius}
                      outerRadius={ring.outerRadius}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      paddingAngle={1.6}
                      cornerRadius={RING_THICKNESS / 2}
                      isAnimationActive={false}
                    >
                      {data.map((entry) => (
                        <Cell key={entry.key} fill={entry.fill} />
                      ))}
                    </Pie>
                  );
                })}
                <Tooltip
                  formatter={(value: number, _name: string, payload) => {
                    const entry = payload?.payload as { label: string; isPrimary: boolean } | undefined;
                    if (!entry || !entry.isPrimary) {
                      return [undefined, undefined];
                    }
                    return [`${value} articles`, entry.label];
                  }}
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                />
              </PieChart>
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
              {ringGeometry.map((item) => {
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
