import type { DB } from './db';
import type { SecretBox } from '../core/secret-box';
import { AIService, FileService } from '../core';
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
  generateCase: ({ ai }, [input, provider, model, apiKey, endpoint]) =>
    ai.generateCaseStudy(input as never, provider as string, model as string, apiKey as string, endpoint as string),
  regenerateSection: ({ ai }, [section, context, provider, model, apiKey, endpoint]) =>
    ai.regenerateSection(section as string, context, provider as string, model as string, apiKey as string, endpoint as string),
  suggestContext: ({ ai }, [domain, complexity, scenarioType, provider, model, apiKey, endpoint]) =>
    ai.suggestContext(domain as string, complexity as string, scenarioType as string, provider as string, model as string, apiKey as string, endpoint as string),
  testConnection: ({ ai }, [provider, apiKey, endpoint]) => ai.testConnection(provider as string, apiKey as string, endpoint as string),
  getOllamaModels: ({ ai }, [endpoint, bearer]) => ai.getOllamaModels(endpoint as string, bearer as string),
  analyzePracticeSession: ({ ai }, [pc, provider, model, apiKey, endpoint]) =>
    ai.analyzePracticeSession(pc as never, provider as string, model as string, apiKey as string, endpoint as string),
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
