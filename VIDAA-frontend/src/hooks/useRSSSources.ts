import { useState, useEffect } from 'react';
import { RSSSource } from '../types/rss';
import { getApiUrl } from '../constants/api';
import { CacheService } from '../services/CacheService';

export function useRSSSources() {
  const [rssSources, setRssSources] = useState<RSSSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRSSSources = async () => {
      const cache = CacheService.getInstance();
      const cachedData = cache.get<RSSSource[]>('rssSources');

      if (cachedData) {
        setRssSources(cachedData);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl('RSS_LIST'));
        if (!response.ok) {
          throw new Error('Failed to fetch RSS sources');
        }
        const data = await response.json();

        cache.set('rssSources', data);
        setRssSources(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRSSSources();
  }, []);

  return { rssSources, loading, error };
}
