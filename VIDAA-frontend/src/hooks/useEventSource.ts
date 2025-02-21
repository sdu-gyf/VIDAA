import { useState, useEffect, useRef, useCallback } from 'react';
import { EventSourceService } from '../services/EventSourceService';
import { CacheService } from '../services/CacheService';

export function useEventSource<T>(url: string, options = { useCache: true }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<EventSourceService<T> | null>(null);
  const cache = CacheService.getInstance();

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
  }, []);

  const reconnect = useCallback(() => {
    reset();
    serviceRef.current?.disconnect();
    serviceRef.current = new EventSourceService<T>(url);
    connect();
  }, [url, reset]);

  const connect = useCallback(() => {
    if (!serviceRef.current || !url) return;
    console.log('Connecting to EventSource:', url);

    setLoading(true);
    serviceRef.current.connect({
      onMessage: (newData) => {
        console.log('Received message:', newData);
        setData(prev => {
          const newDataArray = [...prev, newData];
          if (options.useCache) {
            cache.set(url, newDataArray);
          }
          return newDataArray;
        });
      },
      onComplete: () => {
        console.log('EventSource completed');
        setLoading(false);
      },
      onError: (err) => {
        console.error('EventSource error:', err);
        setError(err);
        setLoading(false);
      }
    });
  }, [url, options.useCache]);

  useEffect(() => {
    if (!url) {
      reset();
      return;
    }

    if (options.useCache) {
      const cachedData = cache.get<T[]>(url);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    console.log('Setting up EventSource for URL:', url);
    reset();
    serviceRef.current = new EventSourceService<T>(url);
    connect();

    return () => {
      console.log('Cleaning up EventSource');
      serviceRef.current?.disconnect();
    };
  }, [url, connect, reset, options.useCache]);

  const clearCache = useCallback(() => {
    cache.remove(url);
  }, [url]);

  return {
    data,
    loading,
    error,
    reconnect,
    clearCache
  };
}
