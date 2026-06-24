import type { CaseStudy, Collection, AIUsage, PracticeSession, CaseFilters, UserPreferences } from '../shared/types';

export interface UsageStats {
  totalTokens: number;
  totalCost: number;
  sessionTokens: number;
  sessionCost: number;
  mostUsedProvider: string;
  sessionStart: string;
}

// The data-access contract shared by the desktop (node-json-db) and server
// (SQLite) backends. A Store instance is scoped to a single user: the desktop
// has one implicit user; the server creates one per authenticated account.
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
