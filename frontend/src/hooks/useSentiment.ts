import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import type { SentimentSnapshot } from '../api/types';

interface UseSentimentOptions {
  symbol?: string;
}

export function useSentiment(options?: UseSentimentOptions) {
  const params = options?.symbol ? { symbol: options.symbol } : undefined;
  const queryKey = options?.symbol ? ['sentiment', options.symbol] : ['sentiment'];

  return useQuery<SentimentSnapshot>({
    queryKey,
    queryFn: async () => {
      const response = await client.get<SentimentSnapshot>('/sentiment', { params });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}
