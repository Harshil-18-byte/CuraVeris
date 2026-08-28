# Phase 18 — Production push notifications

Implemented persistent, provider-neutral notification infrastructure: user preferences, event deduplication, multiple eligible devices, persistent delivery attempts, retry scheduling, revoked-device cancellation, priority, read state, and deep-link metadata.

Push tokens are stored encrypted on device records. The only supported providers are declared as FCM, APNS, and WEB_PUSH; delivery uses an adapter boundary. With no configured provider credentials, delivery returns `REQUIRES_EXTERNAL_VERIFICATION` and never reports a simulated success.

Migration `20260828_0003_notifications` adds the notification tables and push-token columns to existing databases. It is additive and preserves existing device records.

FCM, APNs, browser Push API configuration, permission prompts, foreground/background rendering, provider token expiry, and physical-device delivery all require platform/client implementation plus provider credentials. They are **REQUIRES EXTERNAL VERIFICATION**.
