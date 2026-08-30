/**
 * Startup Health Check & 404 Auto-Recovery Workflow.
 * Probes root route availability and API health during application bootstrap.
 */

import { analytics } from '../analytics/events';

export interface StartupProbeResult {
  isHealthy: boolean;
  homepageStatus: number;
  apiHealth: boolean;
  recoveryTriggered: boolean;
}

export async function runStartupHealthProbe(): Promise<StartupProbeResult> {
  const result: StartupProbeResult = {
    isHealthy: true,
    homepageStatus: 200,
    apiHealth: true,
    recoveryTriggered: false,
  };

  if (typeof window === 'undefined') return result;

  try {
    // 1. Probe API health endpoint
    const apiRes = await fetch('http://localhost:8000/api/v1/health', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    }).catch(() => null);

    result.apiHealth = apiRes?.ok || false;

    // 2. Check if current location or homepage returns 404
    if (window.location.pathname === '/404' || document.title.includes('404')) {
      result.homepageStatus = 404;
      result.isHealthy = false;
      result.recoveryTriggered = true;

      console.warn('[StartupHealth] Detected 404 on homepage routing. Triggering automatic recovery...');
      analytics.track('startup_health_404_recovery', {
        pathname: window.location.pathname,
        timestamp: new Date().toISOString(),
      });

      // Recovery workflow: redirect to canonical root
      setTimeout(() => {
        window.location.replace('/');
      }, 500);
    }
  } catch (e) {
    console.error('[StartupHealth] Health probe error:', e);
  }

  return result;
}
