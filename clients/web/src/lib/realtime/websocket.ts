/**
 * Resilient Realtime WebSocket Client with Auto-Reconnect and Heartbeat.
 */
import { authStore } from '../auth/store';

export type WebSocketEventHandler = (data: unknown) => void;

export class RealtimeClient {
  private url: string;
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<WebSocketEventHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isExplicitlyClosed = false;

  constructor(path = '/ws') {
    const defaultWsHost = typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000`
      : 'ws://localhost:8000';
    this.url = `${defaultWsHost}${path.startsWith('/') ? path : `/${path}`}`;
  }

  public connect(): void {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    const token = authStore.getToken();
    const connectUrl = token ? `${this.url}?token=${encodeURIComponent(token)}` : this.url;

    try {
      this.ws = new WebSocket(connectUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection_status', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const type = payload.type || payload.event || 'message';
          this.emit(type, payload.data || payload);
        } catch {
          this.emit('message', event.data);
        }
      };

      this.ws.onerror = (err) => {
        this.emit('error', err);
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.emit('connection_status', { status: 'disconnected' });
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      console.warn('WebSocket connection error:', e);
      this.scheduleReconnect();
    }
  }

  public subscribe(event: string, handler: WebSocketEventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  public send(event: string, data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, data }));
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private emit(event: string, data: unknown): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (e) {
        console.error(`Error in WebSocket handler for event ${event}:`, e);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const realtimeClient = new RealtimeClient();
