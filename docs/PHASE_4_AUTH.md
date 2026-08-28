# Phase 4 — Authentication, authorization, and device identity

## Existing behavior retained

Email/password registration and login, bcrypt password hashing, signed JWT access tokens, persisted refresh-token rotation, logout, RBAC helpers, and tenant isolation are retained.

## Changes

1. Public registration creates patient accounts only. Privileged organization roles require a separate, authenticated provisioning flow in a later authorization phase.
2. Login rejects inactive users. Refresh and logout require a refresh token owned by the authenticated user.
3. Device registration records a client-generated installation identifier, platform, and lifecycle state. It never treats an installation identifier, phone suggestion, or SIM result as verified identity.
4. The phone-verification state remains unavailable until an approved delivery provider is configured. No OTP is generated, accepted, or claimed delivered by CuraVeris.

## Platform capability limits

| Platform | Supported Phase 4 behavior | Phone-number discovery |
|---|---|---|
| Web | Manual number entry only | Browsers do not provide a reliable SIM/phone-number API |
| Android | Client may request a user-mediated number hint using official Android APIs in a later client increment | No direct SIM number access is assumed; eSIM, dual-SIM, denied permission, tablets and unavailable numbers fall back to editable manual entry |
| iOS | Manual number entry only | iOS does not expose general SIM phone-number access to apps |

Automatic suggestions are never verification. The required flow is suggestion → user edit/confirm → approved provider delivery → verification. The final two steps are **unavailable** until a provider is configured.

