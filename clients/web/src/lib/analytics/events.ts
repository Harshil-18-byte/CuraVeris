/**
 * CuraVeris Client Analytics Engine.
 * Tracks search telemetry, empty-result occurrences, and UI error events.
 */

export interface AnalyticsEvent {
  event_name: string;
  payload: Record<string, any>;
  timestamp: string;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];

  track(eventName: string, payload: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event_name: eventName,
      payload: {
        ...payload,
        url: typeof window !== 'undefined' ? window.location.pathname : '',
      },
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    if (typeof window !== 'undefined') {
      // Expose to window for Playwright E2E test assertions
      (window as any).__CURAVERIS_ANALYTICS_EVENTS__ = this.events;

      // Dispatch custom DOM event for live listeners
      window.dispatchEvent(
        new CustomEvent('curaveris:analytics', { detail: event })
      );
    }
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
    if (typeof window !== 'undefined') {
      (window as any).__CURAVERIS_ANALYTICS_EVENTS__ = [];
    }
  }
}

export const analytics = new AnalyticsTracker();
