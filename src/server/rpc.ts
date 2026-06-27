import type { DB } from './db';
import type { SecretBox } from '../core/secret-box';
import { AIService, FileService, assertPublicUrl } from '../core';
import { SqliteStore } from './sqlite-store';

// One handler per electronAPI method. Each receives the per-user store, the
// shared AI/file services, and the call arguments. This is the HTTP mirror of
// the Electron IPC channels, so the web client can expose an identical API.
export interface RpcContext {
  store: SqliteStore;
  ai: AIService;
  files: FileService;
}

type Handler = (ctx: RpcContext, args: unknown[]) => Promise<unknown> | unknown;
// SSRF defence: a caller-supplied AI endpoint (Ollama address or
// OpenAI-compatible base URL) must never reach a private/loopback address.
// Only http(s) and never RFC1918/link-local/metadata. (Desktop IPC bypasses
// the server entirely, so local Ollama there is unaffected.)
async function guardEndpoint(endpoint: unknown): Promise<void> {
  if (typeof endpoint === 'string' && endpoint.trim() !== '') {
    await assertPublicUrl(endpoint);
  }
}

// The web client never sends API keys for generation/analysis calls (httpApi
// omits them); the server resolves them from its encrypted store so keys do
// not traverse the wire on every request. Endpoints for ollama /
// openai-compatible are resolved the same way. AIService still falls back to
// system env keys when the store has none.
async function resolveCreds(
  ctx: RpcContext,
  provider: string,
): Promise<{ apiKey?: string; endpoint?: string }> {
  const prefs = await ctx.store.getPreferences();
  const p = (provider || '').toLowerCase();
  if (p === 'ollama') {
    return { apiKey: prefs.ollama_bearer || undefined, endpoint: prefs.ollama_endpoint || undefined };
  }
  if (p === 'openai-compatible') {
    return { apiKey: prefs.api_keys?.['openai-compatible'] || undefined, endpoint: prefs.openai_base_url || undefined };
  }
  return { apiKey: prefs.api_keys?.[provider] || undefined, endpoint: undefined };
}

export const RPC_METHODS: Record<string, Handler> = {
  // Cases
  getCases: ({ store }, [filters]) => store.getCases(filters as never),
  saveCase: ({ store }, [caseData]) => store.saveCase(caseData as never),
  deleteCase: ({ store }, [id]) => store.deleteCase(id as number),
  searchCases: ({ store }, [query]) => store.searchCases(query as string),

  // Preferences
  getPreferences: ({ store }) => store.getPreferences(),
  setPreference: ({ store }, [key, value]) => store.setPreference(key as string, value),

  // Usage
  getUsageStats: ({ store }) => store.getUsageStats(),
  trackAIUsage: ({ store }, [usage]) => store.trackAIUsage(usage as never),

  // Practice
  savePracticeSession: ({ store }, [session]) => store.savePracticeSession(session as never),
  getPracticeSessions: ({ store }, [caseId]) => store.getPracticeSessions(caseId as number),

  // Collections
  getCollections: ({ store }) => store.getCollections(),
  saveCollection: ({ store }, [c]) => store.saveCollection(c as never),
  deleteCollection: ({ store }, [id]) => store.deleteCollection(id as number),
  addCaseToCollection: ({ store }, [caseId, collectionId]) => store.addCaseToCollection(caseId as number, collectionId as number),
  removeCaseFromCollection: ({ store }, [caseId, collectionId]) => store.removeCaseFromCollection(caseId as number, collectionId as number),
  getCasesByCollection: ({ store }, [collectionId]) => store.getCasesByCollection(collectionId as number),
  getCollectionsByCase: ({ store }, [caseId]) => store.getCollectionsByCase(caseId as number),

  // AI
  generateCase: async (ctx, [input, provider, model]) => {
    const { apiKey, endpoint } = await resolveCreds(ctx, provider as string);
    await guardEndpoint(endpoint);
    return ctx.ai.generateCaseStudy(input as never, provider as string, model as string, apiKey, endpoint);
  },
  regenerateSection: async (ctx, [section, context, provider, model]) => {
    const { apiKey, endpoint } = await resolveCreds(ctx, provider as string);
    await guardEndpoint(endpoint);
    return ctx.ai.regenerateSection(section as string, context, provider as string, model as string, apiKey, endpoint);
  },
  suggestContext: async (ctx, [domain, complexity, scenarioType, provider, model]) => {
    const { apiKey, endpoint } = await resolveCreds(ctx, provider as string);
    await guardEndpoint(endpoint);
    return ctx.ai.suggestContext(domain as string, complexity as string, scenarioType as string, provider as string, model as string, apiKey, endpoint);
  },
  // testConnection prefers a caller-supplied key (testing unsaved form input);
  // when none is supplied it resolves the stored key so a configured-but-masked
  // provider can still be tested. Endpoint is SSRF-validated either way.
  testConnection: async (ctx, [provider, apiKey, endpoint]) => {
    await guardEndpoint(endpoint);
    const key = (apiKey as string) || (await resolveCreds(ctx, provider as string)).apiKey;
    return ctx.ai.testConnection(provider as string, key, endpoint as string);
  },
  getOllamaModels: async ({ ai }, [endpoint, bearer]) => {
    await guardEndpoint(endpoint);
    return ai.getOllamaModels(endpoint as string, bearer as string);
  },
  analyzePracticeSession: async (ctx, [pc, provider, model]) => {
    const { apiKey, endpoint } = await resolveCreds(ctx, provider as string);
    await guardEndpoint(endpoint);
    return ctx.ai.analyzePracticeSession(pc as never, provider as string, model as string, apiKey, endpoint);
  },
  // No-op on a multi-user server (endpoint is passed per call instead).
  setOllamaEndpoint: () => undefined,

  // Files (import paths; export handled via a dedicated download route)
  importCaseFromURL: ({ files }, [url]) => files.importCaseFromURL(url as string),
  importBulkCasesFromURL: ({ files }, [url]) => files.importBulkCasesFromURL(url as string),
  importBulkCasesFromFile: ({ files }, [content]) => files.importBulkCasesFromFile(content as string),
};

export function makeContext(db: DB, userId: number, secretBox: SecretBox, ai: AIService, files: FileService): RpcContext {
  return { store: new SqliteStore(db, userId, secretBox), ai, files };
}
