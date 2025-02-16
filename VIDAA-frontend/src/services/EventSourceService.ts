type EventSourceCallback<T> = (data: T) => void;

export class EventSourceService<T> {
  private eventSource: EventSource | null = null;
  private url: string;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(url: string) {
    this.url = url;
  }

  private retry(callbacks: {
    onMessage?: EventSourceCallback<T>;
    onComplete?: () => void;
    onError?: (error: string) => void;
  }): void {
    if (this.retryCount < this.MAX_RETRIES) {
      this.retryCount++;
      setTimeout(() => {
        this.connect(callbacks);
      }, this.RETRY_DELAY * this.retryCount);
    } else {
      callbacks.onError?.('Maximum retry attempts reached');
      this.disconnect();
    }
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
          this.retry(callbacks);
          return;
        }

        this.retryCount = 0; // Reset retry count on successful message
        callbacks.onMessage?.(data);
      } catch (error) {
        callbacks.onError?.('Failed to parse message');
        this.retry(callbacks);
      }
    };

    this.eventSource.onerror = () => {
      this.retry(callbacks);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.retryCount = 0;
    }
  }
}
