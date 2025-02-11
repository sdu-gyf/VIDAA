type EventSourceCallback<T> = (data: T) => void;

export class EventSourceService<T> {
  private eventSource: EventSource | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(callbacks: {
    onMessage?: EventSourceCallback<T>;
    onComplete?: () => void;
    onError?: (error: string) => void;
  }): void {
    if (this.eventSource) {
      return;
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'complete') {
          callbacks.onComplete?.();
          this.disconnect();
          return;
        }

        if (data.type === 'error') {
          callbacks.onError?.(data.error || 'Unknown error');
          this.disconnect();
          return;
        }

        callbacks.onMessage?.(data);
      } catch (error) {
        callbacks.onError?.('Failed to parse message');
        this.disconnect();
      }
    };

    this.eventSource.onerror = () => {
      callbacks.onError?.('Connection error');
      this.disconnect();
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
