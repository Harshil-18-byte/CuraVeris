/**
 * CuraVeris Industry-Standard Client Persistence Engine.
 * 
 * Guarantees that user sessions, uploaded bill analyses, legal dispute drafts,
 * and conversational threads survive browser closes, app restarts, and page reloads.
 */

const STORAGE_PREFIX = 'curaveris_';

export const StorageKeys = {
  ACTIVE_BILL: `${STORAGE_PREFIX}active_bill_audit`,
  SAVED_BILLS_CACHE: `${STORAGE_PREFIX}saved_bills_cache`,
  DISPUTE_DRAFT: `${STORAGE_PREFIX}dispute_letter_draft`,
  COPILOT_MESSAGES: `${STORAGE_PREFIX}copilot_messages`,
  RECENT_BENCHMARKS: `${STORAGE_PREFIX}recent_benchmarks`,
  DEVICE_INSTALL_ID: `${STORAGE_PREFIX}installation_id`,
  DEVICE_MODE: `${STORAGE_PREFIX}device_mode`,
} as const;

export class PersistenceEngine {
  /**
   * Safely write JSON payload to local persistent storage.
   */
  static set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const serialized = JSON.stringify({
        data: value,
        updated_at: new Date().toISOString(),
      });
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.warn(`[PersistenceEngine] Failed saving ${key} to storage:`, e);
      return false;
    }
  }

  /**
   * Safely read and deserialize payload with fallback.
   */
  static get<T>(key: string, fallback: T | null = null): T | null {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      return parsed.data !== undefined ? parsed.data : parsed;
    } catch (e) {
      console.warn(`[PersistenceEngine] Failed reading ${key} from storage:`, e);
      return fallback;
    }
  }

  /**
   * Remove a specific key.
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[PersistenceEngine] Failed removing ${key}:`, e);
    }
  }

  /**
   * Clear all application persistence (used during DPDP Right to Erasure / Logout).
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('[PersistenceEngine] Failed clearing storage:', e);
    }
  }
}
