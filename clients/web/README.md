---
{
  "id": "file_xe918x8b",
  "filetype": "document",
  "filename": "README",
  "created_at": "2026-09-02T11:26:08.519Z",
  "updated_at": "2026-09-02T11:26:14.581Z",
  "meta": {
    "location": "/",
    "tags": [],
    "categories": [],
    "description": "",
    "source": "markdown"
  }
}
---
# CuraVeris Multi-Platform Web Client

The authoritative frontend for CuraVeris built with **Next.js 14 App Router**, **React 18**, **Framer Motion**, and **TanStack React Query**.

## Key Features

1. **Zero Icons & Zero Gradients Architectural Design System**:
   - Clean, solid matte surfaces (`#090D16`, `#0F172A`, `#1E293B`) with high-contrast borders and solid semantic status colors.
   - Replaced all icon dependencies with styled monospaced badges (`[NPPA CAP]`, `[DPCO]`, `[CGHS]`, `[SECTION 65B]`, `[VERIFIED]`) and typographic indicators (`->`, `•`, `*`).
2. **Device-Adaptive Layout Engine (**`AppLayout.tsx`**)**:
   - In-app switcher (`[Web]`, `[iOS]`, `[Android]`) allowing instant desktop and mobile phone chassis previews with automatic viewport detection on mobile devices.
3. **Mobile Startup Splash with React Bits** `<TrueFocus />` **(**`MobileStartupSplash.tsx`**)**:
   - Phone-exclusive animated intro highlighting *"CuraVeris Financial Truth"* with a word-by-word dynamic focus frame and professional description, auto-advancing in ≤ 2.8s.
4. **Client Persistence Engine (**`persistence.ts`**)**:
   - Preserves active invoice audits, custom dispute letter drafts, AI Copilot chat history, and device preferences across page reloads and app restarts.
5. **Pure Raw Dynamic Data Flow**:
   - Zero hardcoded mock arrays. Starts from a clean zero-state for new users, querying live FastAPI backend endpoints (`/api/v1/bills/benchmark-check`, `/api/v1/bills/upload`, `/api/v1/finance/metrics`, `/api/v1/chat/`).
6. **Quality & Resilience**:
   - React `ErrorBoundary` preventing blank screens with user-friendly recovery.
   - Startup health probe detecting 404 routing anomalies and self-healing.
   - Runtime schema and statutory taxonomy validator.
   - Viewport-based lazy loading with Framer Motion (`LazyThumbnail.tsx`).

## Available Scripts

```bash
# Start local development server on port 3000
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Build optimized production bundle
npm run build

# Start production server
npm start

# Run Playwright E2E test suite (empty results & search analytics)
npm run test:e2e
```