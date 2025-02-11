import { useState, useEffect, useRef } from 'react';
import { EventSourceService } from '../services/EventSourceService';

export function useEventSource<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceRef = useRef<EventSourceService<T> | null>(null);

  useEffect(() => {
    serviceRef.current = new EventSourceService<T>(url);

    serviceRef.current.connect({
      onMessage: (newData) => {
        setData(prev => [...prev, newData]);
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
