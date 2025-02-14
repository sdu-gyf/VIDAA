import { useState, useEffect, useRef } from 'react';
import { EventSourceService } from '../services/EventSourceService';

// Global cache for storing articles data from different RSS sources
const articleCache = new Map<string, any[]>();

export function useEventSource<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceRef = useRef<EventSourceService<T> | null>(null);

  useEffect(() => {
    // Check if data exists in cache
    if (articleCache.has(url)) {
      setData(articleCache.get(url) || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    setData([]);

    if (serviceRef.current) {
      serviceRef.current.disconnect();
    }

    serviceRef.current = new EventSourceService<T>(url);

    serviceRef.current.connect({
      onMessage: (newData) => {
        setData(prev => {
          const newDataArray = [...prev, newData];
          // Update cache with new data
          articleCache.set(url, newDataArray);
          return newDataArray;
        });
      },
      onComplete: () => {
        setLoading(false);
      },
      onError: (err) => {
        setError(err);
        setLoading(false);
      }
    });

    return () => {
      serviceRef.current?.disconnect();
    };
  }, [url]);

  return { data, loading, error };
}
