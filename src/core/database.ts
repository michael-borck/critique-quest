import { JsonDB, Config } from 'node-json-db';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { SecretBox } from './secret-box';
import type { Store } from './store';
import { encryptApiKeys, decryptApiKeys } from './api-keys';
import type { CaseStudy, Collection, AIUsage, PracticeSession, CaseFilters, UserPreferences } from '../shared/types';

export interface DatabaseOptions {
  dataDir: string;       // base data directory; the JSON db lives in <dataDir>/database
  secretBox: SecretBox;  // at-rest encryption for API keys
}

export class DatabaseManager implements Store {
  private db: JsonDB | null = null;
  private dbPath: string;
  private secretBox: SecretBox;

  constructor(options: DatabaseOptions) {
    const dbDir = join(options.dataDir, 'database');

    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    this.dbPath = join(dbDir, 'scenarios.json');
    this.secretBox = options.secretBox;
  }

  async initialize(): Promise<void> {
    this.db = new JsonDB(new Config(this.dbPath, true, false, '/'));
    await this.setupDefaults();
  }

  // API keys are encrypted at rest via the injected SecretBox (see ./api-keys).
  private encryptApiKeys(keys: Record<string, string>): Record<string, string> {
    return encryptApiKeys(keys, this.secretBox);
  }

  private decryptApiKeys(keys: Record<string, string>): Record<string, string> {
    return decryptApiKeys(keys, this.secretBox);
  }

  private async setupDefaults(): Promise<void> {
    const db = this.db;
    if (!db) throw new Error('Database not initialized');

    // Initialize each top-level key if absent. Keys are independent: a failure
    // on one must NOT rewrite the root and wipe existing data. (An earlier
    // blanket catch did exactly that on any transient error, silently
    // destroying a user's library.) Real failures now propagate to the caller.
    const ensureArray = async (path: string) => {
      try {
        await db.getData(path);
      } catch {
        await db.push(path, [], false);
      }
    };

    await ensureArray('/cases');
    await ensureArray('/ai_usage');
    await ensureArray('/practice_sessions');
    await ensureArray('/collections');
    await ensureArray('/case_collections');

    try {
      await db.getData('/preferences');
    } catch {
      await db.push('/preferences', {
        theme: 'light',
        default_ai_provider: 'openai',
        default_ai_model: 'gpt-4',
        api_keys: {},
        default_generation_settings: {
          domain: 'Business',
          complexity: 'Intermediate',
          scenario_type: 'Problem-solving',
          length_preference: 'Medium'
        },
        default_home_page: 'generation',
        enable_practice_ai_analysis: false,
        enable_high_contrast: false
      }, false);
    }
  }

  // Serializes read-modify-write operations. node-json-db rewrites the whole
  // file on every push and has no locking, so two concurrent IPC writes could
  // otherwise read the same array and clobber each other's changes. All
  // mutating methods run through this queue so they execute one at a time.
  private writeChain: Promise<unknown> = Promise.resolve();
  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const result = this.writeChain.then(task, task);
    this.writeChain = result.then(() => undefined, () => undefined);
    return result;
  }

  // Next monotonic id without spreading the array into Math.max (which can blow
  // the call stack for large collections).
  private nextId(items: Array<{ id?: number }>): number {
    return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  }

  async getCases(filters?: CaseFilters): Promise<CaseStudy[]> {
    if (!this.db) throw new Error('Database not initialized');

    let cases: CaseStudy[] = [];
    try {
      cases = (await this.db.getData('/cases') as unknown) as CaseStudy[];
    } catch {
      // If no cases exist, return empty array
      return [];
    }
    
    if (!filters) {
      return cases.sort((a, b) => new Date(b.modified_date || 0).getTime() - new Date(a.modified_date || 0).getTime());
    }

    let filteredCases = cases;

    if (filters.domain) {
      filteredCases = filteredCases.filter(c => c.domain === filters.domain);
    }

    if (filters.complexity) {
      filteredCases = filteredCases.filter(c => c.complexity === filters.complexity);
    }

    if (filters.favorite) {
      filteredCases = filteredCases.filter(c => c.is_favorite);
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredCases = filteredCases.filter(c => 
        filters.tags!.some(tag => c.tags.includes(tag))
      );
    }

    return filteredCases.sort((a, b) => new Date(b.modified_date || 0).getTime() - new Date(a.modified_date || 0).getTime());
  }

  async saveCase(caseData: CaseStudy): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      let cases: CaseStudy[] = [];
      try {
        cases = (await db.getData('/cases') as unknown) as CaseStudy[];
      } catch {
        // Initialize cases array if it doesn't exist
        await db.push('/cases', [], false);
        cases = [];
      }
      const now = new Date().toISOString();

      if (caseData.id) {
        // Update existing case
        const index = cases.findIndex(c => c.id === caseData.id);
        if (index >= 0) {
          cases[index] = {
            ...caseData,
            modified_date: now
          };
          await db.push('/cases', cases);
          return caseData.id;
        }
        throw new Error('Case not found');
      } else {
        // Insert new case
        const newId = this.nextId(cases);
        const newCase: CaseStudy = {
          ...caseData,
          id: newId,
          created_date: now,
          modified_date: now
        };

        cases.push(newCase);
        await db.push('/cases', cases);
        return newId;
      }
    });
  }

  async deleteCase(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      let cases: CaseStudy[] = [];
      try {
        cases = (await db.getData('/cases') as unknown) as CaseStudy[];
      } catch {
        // No cases to delete
        return;
      }
      const filteredCases = cases.filter(c => c.id !== id);
      await db.push('/cases', filteredCases);
    });
  }

  async searchCases(query: string): Promise<CaseStudy[]> {
    if (!this.db) throw new Error('Database not initialized');

    let cases: CaseStudy[] = [];
    try {
      cases = (await this.db.getData('/cases') as unknown) as CaseStudy[];
    } catch {
      return [];
    }
    const searchTerm = query.toLowerCase();

    const filtered = cases.filter(caseStudy => 
      caseStudy.title.toLowerCase().includes(searchTerm) ||
      caseStudy.content.toLowerCase().includes(searchTerm) ||
      caseStudy.questions.toLowerCase().includes(searchTerm)
    );

    return filtered.sort((a, b) => new Date(b.modified_date || 0).getTime() - new Date(a.modified_date || 0).getTime());
  }

  async getPreferences(): Promise<UserPreferences> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const prefs = (await this.db.getData('/preferences') as unknown) as UserPreferences;
      if (prefs.api_keys) {
        prefs.api_keys = this.decryptApiKeys(prefs.api_keys);
      }
      return prefs;
    } catch {
      // Return default preferences if none exist
      return {
        theme: 'light',
        default_ai_provider: 'openai',
        default_ai_model: 'gpt-4',
        api_keys: {},
        default_generation_settings: {
          domain: 'Business',
          complexity: 'Intermediate',
          scenario_type: 'Problem-solving',
          length_preference: 'Medium'
        },
        default_home_page: 'generation',
        enable_practice_ai_analysis: false,
        enable_high_contrast: false
      };
    }
  }

  async setPreference(key: string, value: unknown): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      const storedValue = key === 'api_keys' && value && typeof value === 'object'
        ? this.encryptApiKeys(value as Record<string, string>)
        : value;
      try {
        const preferences = (await db.getData('/preferences') as unknown) as Record<string, unknown>;
        preferences[key] = storedValue;
        await db.push('/preferences', preferences);
      } catch {
        await db.push('/preferences', { [key]: storedValue });
      }
    });
  }

  async trackAIUsage(usage: AIUsage): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      let aiUsageList: AIUsage[] = [];
      try {
        aiUsageList = (await db.getData('/ai_usage') as unknown) as AIUsage[];
      } catch {
        await db.push('/ai_usage', [], false);
        aiUsageList = [];
      }
      const newUsage: AIUsage = {
        ...usage,
        id: this.nextId(aiUsageList),
        timestamp: new Date().toISOString()
      };

      aiUsageList.push(newUsage);
      await db.push('/ai_usage', aiUsageList);
    });
  }

  async savePracticeSession(session: PracticeSession & { analysis?: unknown }): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      let sessions: PracticeSession[] = [];
      try {
        sessions = (await db.getData('/practice_sessions') as unknown) as PracticeSession[];
      } catch {
        await db.push('/practice_sessions', [], false);
        sessions = [];
      }
      const newId = this.nextId(sessions);

      const newSession: PracticeSession = {
        ...session,
        id: newId
      };

      sessions.push(newSession);
      await db.push('/practice_sessions', sessions);
      return newId;
    });
  }

  async getPracticeSessions(caseId: number): Promise<PracticeSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sessions: PracticeSession[] = [];
    try {
      sessions = (await this.db.getData('/practice_sessions') as unknown) as PracticeSession[];
    } catch {
      return [];
    }
    return sessions
      .filter(s => s.case_id === caseId)
      .sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime());
  }

  // Collection operations
  private async getCollectionsRaw(): Promise<Collection[]> {
    if (!this.db) throw new Error('Database not initialized');

    let collections: Collection[] = [];
    try {
      collections = (await this.db.getData('/collections') as unknown) as Collection[];
    } catch {
      return [];
    }

    return collections.sort((a, b) => new Date(b.modified_date || 0).getTime() - new Date(a.modified_date || 0).getTime());
  }

  async getCollections(): Promise<Collection[]> {
    const collections = await this.getCollectionsRaw();

    // Calculate case and subcollection counts
    for (const collection of collections) {
      await this.updateCollectionCounts(collection, collections);
    }

    return collections;
  }

  async saveCollection(collectionData: Collection): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      let collections: Collection[] = [];
      try {
        collections = (await db.getData('/collections') as unknown) as Collection[];
      } catch {
        await db.push('/collections', [], false);
        collections = [];
      }

      const now = new Date().toISOString();

      if (collectionData.id) {
        // Update existing collection
        const index = collections.findIndex(c => c.id === collectionData.id);
        if (index >= 0) {
          collections[index] = {
            ...collectionData,
            modified_date: now
          };
          await db.push('/collections', collections);
          return collectionData.id;
        }
        throw new Error('Collection not found');
      } else {
        // Insert new collection
        const newId = this.nextId(collections);
        const newCollection: Collection = {
          ...collectionData,
          id: newId,
          created_date: now,
          modified_date: now
        };

        collections.push(newCollection);
        await db.push('/collections', collections);
        return newId;
      }
    });
  }

  async deleteCollection(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      // Remove the collection
      let collections: Collection[] = [];
      try {
        collections = (await db.getData('/collections') as unknown) as Collection[];
      } catch {
        return;
      }
      const filteredCollections = collections.filter(c => c.id !== id);

      // Remove all case-collection relationships for this collection
      let caseCollections: Array<{case_id: number, collection_id: number}> = [];
      try {
        caseCollections = (await db.getData('/case_collections') as unknown) as Array<{case_id: number, collection_id: number}>;
        const filteredCaseCollections = caseCollections.filter(cc => cc.collection_id !== id);
        await db.push('/case_collections', filteredCaseCollections);
      } catch {
        // No relationships to clean up
      }

      // Update parent_collection_id for subcollections (set to null)
      const updatedCollections = filteredCollections.map(c =>
        c.parent_collection_id === id ? { ...c, parent_collection_id: undefined } : c
      );
      await db.push('/collections', updatedCollections);
    });
  }

  async addCaseToCollection(caseId: number, collectionId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      let caseCollections: Array<{case_id: number, collection_id: number}> = [];
      try {
        caseCollections = (await db.getData('/case_collections') as unknown) as Array<{case_id: number, collection_id: number}>;
      } catch {
        await db.push('/case_collections', [], false);
        caseCollections = [];
      }

      // Check if relationship already exists
      const exists = caseCollections.some(cc => cc.case_id === caseId && cc.collection_id === collectionId);
      if (!exists) {
        caseCollections.push({ case_id: caseId, collection_id: collectionId });
        await db.push('/case_collections', caseCollections);
      }
    });
  }

  async removeCaseFromCollection(caseId: number, collectionId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    return this.serialize(async () => {
      const db = this.db!;
      let caseCollections: Array<{case_id: number, collection_id: number}> = [];
      try {
        caseCollections = (await db.getData('/case_collections') as unknown) as Array<{case_id: number, collection_id: number}>;
      } catch {
        return;
      }

      const filteredCaseCollections = caseCollections.filter(cc =>
        !(cc.case_id === caseId && cc.collection_id === collectionId)
      );
      await db.push('/case_collections', filteredCaseCollections);
    });
  }

  async getCasesByCollection(collectionId: number): Promise<CaseStudy[]> {
    if (!this.db) throw new Error('Database not initialized');

    // Get case-collection relationships
    let caseCollections: Array<{case_id: number, collection_id: number}> = [];
    try {
      caseCollections = (await this.db.getData('/case_collections') as unknown) as Array<{case_id: number, collection_id: number}>;
    } catch {
      return [];
    }

    const caseIds = caseCollections
      .filter(cc => cc.collection_id === collectionId)
      .map(cc => cc.case_id);

    if (caseIds.length === 0) {
      return [];
    }

    // Get cases
    const allCases = await this.getCases();
    return allCases.filter(c => c.id && caseIds.includes(c.id));
  }

  async getCollectionsByCase(caseId: number): Promise<Collection[]> {
    if (!this.db) throw new Error('Database not initialized');

    // Get case-collection relationships
    let caseCollections: Array<{case_id: number, collection_id: number}> = [];
    try {
      caseCollections = (await this.db.getData('/case_collections') as unknown) as Array<{case_id: number, collection_id: number}>;
    } catch {
      return [];
    }

    const collectionIds = caseCollections
      .filter(cc => cc.case_id === caseId)
      .map(cc => cc.collection_id);

    if (collectionIds.length === 0) {
      return [];
    }

    // Get collections (use raw to avoid recursion)
    const allCollections = await this.getCollectionsRaw();
    return allCollections.filter(c => c.id && collectionIds.includes(c.id));
  }

  private async updateCollectionCounts(collection: Collection, allCollections: Collection[]): Promise<void> {
    if (!collection.id) return;

    // Count cases in this collection
    const cases = await this.getCasesByCollection(collection.id);
    collection.case_count = cases.length;

    // Count subcollections using the provided collections array
    collection.subcollection_count = allCollections.filter(c => c.parent_collection_id === collection.id).length;
  }

  async getUsageStats(): Promise<{
    totalTokens: number;
    totalCost: number;
    sessionTokens: number;
    sessionCost: number;
    mostUsedProvider: string;
    sessionStart: string;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const aiUsageList = (await this.db.getData('/ai_usage') as unknown) as AIUsage[];
      
      // Calculate totals
      const totalTokens = aiUsageList.reduce((sum, usage) => sum + (usage.tokens_used || 0), 0);
      const totalCost = aiUsageList.reduce((sum, usage) => sum + (usage.cost_estimate || 0), 0);
      
      // Session is defined as usage from the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const sessionUsage = aiUsageList.filter(usage => 
        usage.timestamp && new Date(usage.timestamp) > oneHourAgo
      );
      
      const sessionTokens = sessionUsage.reduce((sum, usage) => sum + (usage.tokens_used || 0), 0);
      const sessionCost = sessionUsage.reduce((sum, usage) => sum + (usage.cost_estimate || 0), 0);
      
      // Find most used provider
      const providerCounts = aiUsageList.reduce((acc, usage) => {
        acc[usage.provider] = (acc[usage.provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostUsedProvider = Object.entries(providerCounts).length > 0 
        ? Object.entries(providerCounts).sort(([,a], [,b]) => b - a)[0][0]
        : 'None';

      return {
        totalTokens,
        totalCost,
        sessionTokens,
        sessionCost,
        mostUsedProvider,
        sessionStart: oneHourAgo.toISOString(),
      };
    } catch {
      return {
        totalTokens: 0,
        totalCost: 0,
        sessionTokens: 0,
        sessionCost: 0,
        mostUsedProvider: 'None',
        sessionStart: new Date().toISOString(),
      };
    }
  }
}