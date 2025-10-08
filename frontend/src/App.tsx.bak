import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Stack,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useSentiment } from './hooks/useSentiment';
import { SentimentSummary } from './components/SentimentSummary';
import { SentimentBreakdownChart } from './components/SentimentBreakdownChart';
import { ArticleList } from './components/ArticleList';

function App() {
  const [symbolInput, setSymbolInput] = useState('');
  const [activeSymbol, setActiveSymbol] = useState<string | undefined>();

  const { data, error, isLoading, isFetching, refetch } = useSentiment(
    activeSymbol ? { symbol: activeSymbol } : undefined,
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSymbol(symbolInput.trim() || undefined);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            MarketPulse AI
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isFetching}
            sx={{ borderColor: 'rgba(148,163,184,0.4)' }}
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={4}>
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background:
                'linear-gradient(135deg, rgba(56,189,248,0.18), rgba(30,64,175,0.12), rgba(168,85,247,0.14))',
              border: '1px solid rgba(148,163,184,0.16)',
              boxShadow: '0 18px 64px rgba(8,47,73,0.45)',
            }}
          >
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography variant="overline" sx={{ color: 'primary.light', letterSpacing: '0.3em' }}>
                  Insights
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.04em' }}>
                  Real-time market pulse and financial sentiment
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 560, color: 'text.secondary' }}>
                  Track bullish, neutral, and bearish signals in one dashboard. Filter by ticker or keyword to surface
                  focused coverage instantly.
                </Typography>
              </Stack>

              <Box component="form" onSubmit={handleSubmit}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                  <TextField
                    variant="outlined"
                    size="medium"
                    label="Search ticker or topic"
                    placeholder="e.g. AAPL, BTC, Inflation"
                    value={symbolInput}
                    onChange={(event) => setSymbolInput(event.target.value)}
                    InputProps={{
                      sx: {
                        borderRadius: 3,
                        bgcolor: 'rgba(15,23,42,0.6)',
                        backdropFilter: 'blur(8px)',
                      },
                    }}
                    sx={{ flexGrow: 1, minWidth: { xs: '100%', md: 360 } }}
                  />
                  <Button type="submit" variant="contained" size="large" startIcon={<SearchIcon />} sx={{ px: 3.5 }}>
                    Apply Filter
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          {error && (
            <Alert severity="error" variant="filled">
              Failed to load sentiment data. Please try again.
            </Alert>
          )}

          {isLoading ? (
            <Paper
              sx={{
                p: { xs: 5, md: 8 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <CircularProgress color="primary" size={42} />
              <Typography variant="subtitle1">Analyzing the latest market stories…</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 480 }}>
                We are streaming headline data and running our sentiment model against each article to keep this view
                current.
              </Typography>
            </Paper>
          ) : (
            data && (
              <Stack spacing={4}>
                <Box
                  sx={{
                    display: 'grid',
                    gap: { xs: 3, lg: 4 },
                    gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
                  }}
                >
                  <SentimentSummary data={data} />
                  <SentimentBreakdownChart breakdown={data.breakdown} />
                </Box>
                <ArticleList articles={data.articles} />
              </Stack>
            )
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default App;
