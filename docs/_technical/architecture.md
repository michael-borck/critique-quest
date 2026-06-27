---
layout: default
title: "System Architecture"
description: "Technical overview of CritiqueQuest's architecture, components, and design decisions"
nav_order: 1
parent: Technical Documentation
---

# System Architecture
{: .no_toc }

Comprehensive technical overview of CritiqueQuest's design and implementation.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Architectural Overview

CritiqueQuest is **one codebase with two deployments**: an Electron desktop
application and an optional self-hosted multi-user web server. The two share a
transport-agnostic core (`src/core`) and a set of shared types/utilities
(`src/shared`); only the outermost layer — the process that hosts the core and
the wire protocol that reaches it — differs.

- **Desktop** ships as an Electron app. The main process hosts the core and
  exposes it to the renderer over secure IPC. Data lives in a single JSON file
  under the OS user-data directory (`node-json-db`).
- **Self-hosted server** ships as a Fastify + SQLite multi-user web app. A
  per-user `SqliteStore` isolates each account's data, and the same core is
  reached over an HTTP RPC protocol. See [SELF_HOSTING.md](../../SELF_HOSTING.md).

The renderer (React + MUI + Zustand) is identical across both deployments: it
calls `window.electronAPI`, which is injected either by the Electron preload
script (desktop) or by an HTTP adapter (web). No renderer code branches on the
transport.

### High-Level Architecture

```
                         ┌─────────────────────────────────┐
                         │      src/core  (shared)         │
                         │  DatabaseManager | AIService    │
                         │  FileService | Store (port)     │
                         │  SecretBox (port) | url-guard   │
                         └────────────┬────────────────────┘
                                      │ used by both
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
   ┌──────────────────────────────┐         ┌──────────────────────────────┐
   │     Desktop (Electron)       │         │   Self-hosted server         │
   │  main process + IPC          │         │   Fastify + SQLite           │
   │  DatabaseManager (JSON)      │         │   SqliteStore (per-user)     │
   │  ElectronSecretBox (keychain)│         │   EnvSecretBox (AES-256-GCM) │
   └──────────────┬───────────────┘         └──────────────┬───────────────┘
                  │ window.electronAPI                     │ /api/rpc (HTTP)
                  ▼                                        ▼
   ┌──────────────────────────────────────────────────────────────────────┐
   │            Renderer (React 18 + MUI + Zustand)                       │
   │   identical UI for both transports; injects window.electronAPI       │
   └──────────────────────────────────────────────────────────────────────┘
```

## Core Technology Stack

| Layer | Technology |
| --- | --- |
| UI | React 18, TypeScript, Material-UI (MUI) 5, Zustand |
| Desktop shell | Electron 42, hardened main process |
| Web server | Fastify 5 (Node.js) |
| Desktop storage | `node-json-db` (single JSON file in userData) |
| Server storage | `better-sqlite3` (SQLite, WAL mode) |
| AI providers | OpenAI (official SDK), Anthropic Claude (axios), Google Gemini (axios), Ollama (axios) |
| Build | Vite 8 (renderer/web), `tsc` (main + server), electron-builder (packaging) |

Version ranges are declared in `package.json`; the values above reflect the
caret ranges the project depends on.

## Transport-Agnostic Renderer

The renderer never knows whether it is talking to the desktop main process or a
remote server. `src/renderer/main.tsx` detects the transport at startup:

```typescript
// Transport detection: the Electron preload injects window.electronAPI. When it
// is absent we're running as the self-hosted web app, so install the HTTP
// transport and gate the UI behind login.
const isDesktop = !!window.electronAPI;
if (!isDesktop) {
  window.electronAPI = httpApi;
}
```

The Electron preload (`src/main/preload.ts`) uses `contextBridge` to expose a
set of typed methods that each invoke a named IPC channel. The HTTP adapter
(`src/renderer/api/httpApi.ts`) exposes the **same** method surface, posting to
`/api/rpc`. Because both conform to one shape, every component and Zustand store
calls `window.electronAPI.<method>(…)` regardless of deployment.

Views are imported directly in `App.tsx` (no `React.lazy` code-splitting).

## The Store Port

Data access is defined once as a port in `src/core/store.ts` and implemented by
two adapters, one per deployment. A `Store` is always scoped to a single user —
the desktop has one implicit user; the server creates one per authenticated
account.

```typescript
// src/core/store.ts — the data-access contract shared by both backends.
export interface Store {
  initialize(): Promise<void>;

  getCases(filters?: CaseFilters): Promise<CaseStudy[]>;
  saveCase(caseData: CaseStudy): Promise<number>;
  deleteCase(id: number): Promise<void>;
  searchCases(query: string): Promise<CaseStudy[]>;

  getPreferences(): Promise<UserPreferences>;
  setPreference(key: string, value: unknown): Promise<void>;

  trackAIUsage(usage: AIUsage): Promise<void>;
  getUsageStats(): Promise<UsageStats>;

  savePracticeSession(session: PracticeSession & { analysis?: unknown }): Promise<number>;
  getPracticeSessions(caseId: number): Promise<PracticeSession[]>;

  getCollections(): Promise<Collection[]>;
  saveCollection(collectionData: Collection): Promise<number>;
  deleteCollection(id: number): Promise<void>;
  addCaseToCollection(caseId: number, collectionId: number): Promise<void>;
  removeCaseFromCollection(caseId: number, collectionId: number): Promise<void>;
  getCasesByCollection(collectionId: number): Promise<CaseStudy[]>;
  getCollectionsByCase(caseId: number): Promise<Collection[]>;
}
```

- **`DatabaseManager`** (`src/core/database.ts`, desktop) implements `Store`
  over `node-json-db`. Because node-json-db rewrites the entire file on every
  write and has no locking, mutating operations are serialized through a queue
  to prevent concurrent writes from clobbering one another.
- **`SqliteStore`** (`src/server/sqlite-store.ts`, server) implements `Store`
  over `better-sqlite3`. Every query is parameterized with a `user_id`, so each
  account sees only its own rows. The database runs in WAL mode.

There is no shared caching layer, no in-memory `Map` cache, and no abstract
`DatabaseService` — only the `Store` port and its two adapters.

## The SecretBox Port

At-rest encryption of API keys is likewise defined as a port in
`src/core/secret-box.ts` and implemented by two adapters:

```typescript
// src/core/secret-box.ts
export interface SecretBox {
  available(): boolean;
  encrypt(plaintext: string): string; // returns base64 ciphertext
  decrypt(b64: string): string;        // takes base64 ciphertext, returns plaintext
}
```

- **`ElectronSecretBox`** (`src/main/secret-box.ts`, desktop) delegates to
  Electron's `safeStorage`, i.e. the OS keychain (Keychain on macOS,
  DPAPI on Windows, libsecret on Linux).
- **`EnvSecretBox`** (`src/server/secret-box.ts`, server) derives a 32-byte key
  with `scrypt` from the `CRITIQUEQUEST_SECRET` environment variable and
  encrypts with **AES-256-GCM** (random 12-byte IV + auth tag). If the secret is
  unset, `available()` returns `false` and keys are stored as plaintext with a
  startup warning.

`src/core/api-keys.ts` wraps stored values as `enc:<base64>`, tolerates legacy
plaintext on read, and re-encrypts on the next save.

## AI Integration

Provider selection is a **`switch` statement** in `src/core/ai-service.ts`, not
an abstract class hierarchy and not a `Map` of provider instances. Each method
(`generateCaseStudy`, `suggestContext`, `analyzePracticeSession`,
`testConnection`, …) dispatches on the lowercase provider name:

```typescript
// src/core/ai-service.ts — one branch per provider, no class hierarchy.
switch (provider.toLowerCase()) {
  case 'ollama':      /* axios to the (local or remote) Ollama endpoint */
  case 'openai':      /* official OpenAI SDK */
  case 'anthropic':   /* axios to the Claude API */
  case 'google':
  case 'gemini':      /* axios to the Gemini API */
  // ...
}
```

- **OpenAI** uses the official SDK; **Anthropic Claude**, **Google Gemini**, and
  **Ollama** use `axios`. Ollama runs locally (or at a remote address) for a
  fully offline, privacy-first option.
- On the **server**, the renderer never sends an API key on generation or
  analysis calls. The server resolves the key from the user's encrypted
  preferences (`resolveCreds` in `src/server/rpc.ts`) and falls back to process
  environment variables when the store has none. This keeps keys off the wire on
  every request.
- All caller-controlled AI endpoints (the Ollama address or an
  OpenAI-compatible base URL) pass through the SSRF guard before any request is
  made (see [Security](#security-and-privacy)).

### Content Generation Pipeline

```
Input → shared validation → prompt build → provider switch → response parse
      → Store.saveCase → usage tracked
```

Domain, complexity, and concept options are drawn from the shared concept
database in `src/shared/conceptDatabase.ts`; input is validated with the shared
schemas in `src/shared/validation.ts` before the AI service is called.

## Transports in Detail

### Electron IPC (desktop)

The preload script exposes typed methods; the main process registers matching
`ipcMain.handle` handlers. Channels are namespaced with a colon prefix —
**not** kebab-case — e.g. `db:getCases`, `db:saveCase`, `ai:generateCase`,
`ai:suggestContext`, `file:export`, `collection:getCollections`.

```typescript
// src/main/preload.ts (excerpt)
const electronAPI = {
  getCases: (filters?: CaseFilters) => ipcRenderer.invoke('db:getCases', filters),
  saveCase: (caseData: CaseStudy) => ipcRenderer.invoke('db:saveCase', caseData),
  generateCase: (input, provider?, model?, apiKey?, endpoint?) =>
    ipcRenderer.invoke('ai:generateCase', input, provider, model, apiKey, endpoint),
  // …file:, collection:, and the remaining ai: channels
};
```

```typescript
// src/main/main.ts (excerpt) — each channel has a matching handler.
ipcMain.handle('db:saveCase', async (_, caseData) => this.databaseManager.saveCase(caseData));
ipcMain.handle('ai:generateCase', async (_, input, provider, model, apiKey, endpoint) =>
  this.aiService.generateCaseStudy(input, provider, model, apiKey, endpoint));
```

### HTTP RPC (web)

The server exposes a single `/api/rpc` endpoint that dispatches on a method
name to entries in the `RPC_METHODS` table (`src/server/rpc.ts`). Each handler
receives a per-user context (`store`, `ai`, `files`) and mirrors an IPC channel
one-for-one, so the web client presents the identical API the desktop client
does:

```typescript
// src/server/rpc.ts
export const RPC_METHODS: Record<string, Handler> = {
  // Cases / preferences / usage / practice / collections → delegate to the store.
  getCases: ({ store }, [filters]) => store.getCases(filters as never),
  saveCase: ({ store }, [caseData]) => store.saveCase(caseData as never),
  // …
  // AI calls resolve the user's stored key server-side and guard the endpoint.
  generateCase: async (ctx, [input, provider, model]) => {
    const { apiKey, endpoint } = await resolveCreds(ctx, provider as string);
    await guardEndpoint(endpoint);
    return ctx.ai.generateCaseStudy(input as never, provider as string, model as string, apiKey, endpoint);
  },
  // …
};

export function makeContext(db, userId, secretBox, ai, files): RpcContext {
  return { store: new SqliteStore(db, userId, secretBox), ai, files };
}
```

File **export** is handled by a dedicated download route that streams the
generated file back; import paths (`importCaseFromURL`, etc.) are RPC methods.

## Security and Privacy

### Hardened Electron Main Process

```typescript
// src/main/main.ts
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  preload: join(__dirname, 'preload.js'),
}
```

A production Content-Security-Policy is applied via response-header rewriting
(`connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`,
`frame-ancestors 'none'`). The renderer has no direct Node.js or file-system
access — only the methods the preload script chooses to expose.

### SSRF Guard

`src/core/url-guard.ts` exposes `assertPublicUrl`, which rejects non-`http(s)`
URLs and any host that resolves to a loopback, link-local, RFC1918, unique-local,
or CGNAT address (including the `169.254.169.254` cloud-metadata address). It is
applied to every caller-controlled AI endpoint and to URL imports on the server.
Desktop IPC bypasses the server entirely, so a local Ollama instance on the
desktop is unaffected.

```typescript
// src/server/rpc.ts — every caller-supplied endpoint is guarded before use.
async function guardEndpoint(endpoint: unknown): Promise<void> {
  if (typeof endpoint === 'string' && endpoint.trim() !== '') {
    await assertPublicUrl(endpoint);
  }
}
```

### Authentication and Session Management (server only)

`src/server/auth.ts` implements password and session handling:

- **Passwords** are hashed with `scrypt` using a per-password random 16-byte
  salt, then verified with `timingSafeEqual` (constant-time comparison).
- **Sessions** are 32-byte random tokens stored server-side with a 30-day TTL.
  The session cookie is `httpOnly`, `signed`, `sameSite=lax`, and `Secure` in
  production; tampered or unsigned cookies are rejected.
- **Rate limiting** is registered via `@fastify/rate-limit`: a global per-IP cap
  (200 req/min), tightened to 5 req/min on `/api/auth/login` and
  `/api/auth/register` to blunt brute-force attempts.

### Per-User Data Isolation

On the server, a `SqliteStore` is constructed per request with the authenticated
`userId`, and every query carries that `user_id`. One account cannot read or
write another's rows.

### API-Key Encryption at Rest

API keys are never stored in plaintext when encryption is available — they go
through the `SecretBox` port (OS keychain on desktop, AES-256-GCM on server).
See [The SecretBox Port](#the-secretbox-port).

## Data Model

The domain types live in `src/shared/types.ts` and are shared by both
deployments. The core entities are `CaseStudy`, `Collection`,
`PracticeSession`, `AIUsage`, and `UserPreferences`. Each carries stable fields
such as `id`, `title`, `domain`, `complexity`, `scenario_type`, `content`,
`questions`, `tags`, and timestamps; `CaseStudy` also tracks `usage_count` and
applied `concepts`. The educational concept taxonomy backing generation lives in
`src/shared/conceptDatabase.ts`.

## Development and Build

### Scripts

```bash
npm run dev          # Concurrent main (tsc + electron) and renderer (vite)
npm run build        # Build main + renderer
npm run build:server # Build the server (tsc -p src/server)
npm run build:web    # WEB=1 vite build → dist/web (served by the server)
npm run server       # build:server + build:web + start:server
npm run dist         # electron-builder packaging
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # vitest run
```

### Vite Configuration

There is a single `vite.config.ts`. It switches output between the Electron
renderer (`dist/renderer`, relative `base` for `file://`) and the web bundle
(`dist/web`, absolute `base`) via the `WEB` env var. There is **no**
`rollupOptions.manualChunks` configuration — chunking is left to Vite's
defaults:

```typescript
// vite.config.ts
const isWeb = process.env.WEB === '1';
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/renderer'),
  base: isWeb ? '/' : './',
  build: {
    outDir: resolve(__dirname, isWeb ? 'dist/web' : 'dist/renderer'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: isWeb ? { '/api': 'http://localhost:8787' } : undefined,
  },
});
```

### Code Quality

- **ESLint** (flat config, `typescript-eslint`) for linting.
- **Vitest** for tests, including `src/core/url-guard.test.ts`,
  `src/server/*.test.ts`, and `src/shared/*.test.ts`.

The project does **not** use Prettier or Husky; there is no `.prettierrc` or
`.husky` directory.

## Deployment

- **Desktop**: `electron-builder` produces platform-specific installers from the
  configuration in `package.json` (the `build` key), targeting macOS, Windows
  (NSIS), and Linux (AppImage). Output lands in `release/`.
- **Server**: a Docker image / `docker compose` stack runs the Fastify server
  and serves the prebuilt `dist/web` bundle. `CRITIQUEQUEST_SECRET` drives
  at-rest key encryption; an optional bundled Ollama service can be enabled.
  Full instructions are in [SELF_HOSTING.md](../../SELF_HOSTING.md).

---

## Architectural Principles

- **One core, two deployments.** Business logic lives once in `src/core` behind
  small ports (`Store`, `SecretBox`); each deployment supplies adapters. Adding
  a third transport would mean a new adapter pair, not a rewrite.
- **Transport-agnostic UI.** The renderer depends only on `window.electronAPI`;
  swapping IPC for HTTP is invisible to components and stores.
- **Privacy by default.** Local Ollama keeps all AI traffic on-device; even with
  cloud providers, keys are encrypted at rest and (on the server) never re-sent
  per request.
- **Defense in depth on the server.** Scrypt passwords, signed session cookies,
  per-user SQL isolation, SSRF pre-flight checks, and rate-limited auth routes
  layer together rather than relying on any single control.
