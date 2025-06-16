import { JsonDB, Config } from 'node-json-db';
import { join } from 'path';
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import type { CaseStudy, Collection, AIUsage, PracticeSession } from '../shared/types';

export class DatabaseManager {
  private db: JsonDB | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    const dbDir = join(userDataPath, 'database');
    
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
    
    this.dbPath = join(dbDir, 'scenarios.json');
  }

  async initialize(): Promise<void> {
    this.db = new JsonDB(new Config(this.dbPath, true, false, '/'));
    await this.setupDefaults();
  }

  private async setupDefaults(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Initialize empty collections if they don't exist
      try {
        await this.db.getData('/cases');
      } catch {
        await this.db.push('/cases', [], false);
      }

      try {
        await this.db.getData('/preferences');
      } catch {
        const defaults = {
          theme: 'light',
          default_ai_provider: 'openai',
          default_ai_model: 'gpt-4',
          api_keys: {},
          default_generation_settings: {
            domain: 'Business',
            complexity: 'Intermediate',
            scenario_type: 'Problem-solving',
            length_preference: 'Medium'
          }
        };
        await this.db.push('/preferences', defaults, false);
      }

      try {
        await this.db.getData('/ai_usage');
      } catch {
        await this.db.push('/ai_usage', [], false);
      }

      try {
        await this.db.getData('/practice_sessions');
      } catch {
        await this.db.push('/practice_sessions', [], false);
      }

      try {
        await this.db.getData('/collections');
      } catch {
        await this.db.push('/collections', [], false);
      }

      try {
        await this.db.getData('/case_collections');
      } catch {
        await this.db.push('/case_collections', [], false);
      }
    } catch (error) {
      console.error('Database setup error:', error);
      // Initialize with empty database
      await this.db.push('/', {
        cases: [],
        collections: [],
        case_collections: [],
        preferences: {
          theme: 'light',
          default_ai_provider: 'openai',
          default_ai_model: 'gpt-4',
          api_keys: {},
          default_generation_settings: {
            domain: 'Business',
            complexity: 'Intermediate',
            scenario_type: 'Problem-solving',
            length_preference: 'Medium'
          }
        },
        ai_usage: [],
        practice_sessions: []
      }, false);
    }
  }

  async getCases(filters?: any): Promise<CaseStudy[]> {
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

    return filteredCases.sort((a, b) => new Date(b.modified_date || 0).getTime() - new Date(a.modified_date || 0).getTime());
  }

  async saveCase(caseData: CaseStudy): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    let cases: CaseStudy[] = [];
    try {
      cases = (await this.db.getData('/cases') as unknown) as CaseStudy[];
    } catch {
      // Initialize cases array if it doesn't exist
      await this.db.push('/cases', [], false);
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
        await this.db.push('/cases', cases);
        return caseData.id;
      }
      throw new Error('Case not found');
    } else {
      // Insert new case
      const newId = cases.length > 0 ? Math.max(...cases.map(c => c.id || 0)) + 1 : 1;
      const newCase: CaseStudy = {
        ...caseData,
        id: newId,
        created_date: now,
        modified_date: now
      };
      
      cases.push(newCase);
      await this.db.push('/cases', cases);
      return newId;
    }
  }

  async deleteCase(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    let cases: CaseStudy[] = [];
    try {
      cases = (await this.db.getData('/cases') as unknown) as CaseStudy[];
    } catch {
      // No cases to delete
      return;
    }
    const filteredCases = cases.filter(c => c.id !== id);
    await this.db.push('/cases', filteredCases);
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

  async getPreferences(): Promise<Record<string, any>> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      return (await this.db.getData('/preferences') as unknown) as Record<string, any>;
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
        }
      };
    }
  }

  async setPreference(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const preferences = (await this.db.getData('/preferences') as unknown) as Record<string, any>;
      preferences[key] = value;
      await this.db.push('/preferences', preferences);
    } catch {
      await this.db.push('/preferences', { [key]: value });
    }
  }

  async trackAIUsage(usage: AIUsage): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    let aiUsageList: AIUsage[] = [];
    try {
      aiUsageList = (await this.db.getData('/ai_usage') as unknown) as AIUsage[];
    } catch {
      await this.db.push('/ai_usage', [], false);
      aiUsageList = [];
    }
    const newUsage: AIUsage = {
      ...usage,
      id: aiUsageList.length > 0 ? Math.max(...aiUsageList.map(u => u.id || 0)) + 1 : 1,
      timestamp: new Date().toISOString()
    };
    
    aiUsageList.push(newUsage);
    await this.db.push('/ai_usage', aiUsageList);
  }

  async savePracticeSession(session: PracticeSession): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    let sessions: PracticeSession[] = [];
    try {
      sessions = (await this.db.getData('/practice_sessions') as unknown) as PracticeSession[];
    } catch {
      await this.db.push('/practice_sessions', [], false);
      sessions = [];
    }
    const newId = sessions.length > 0 ? Math.max(...sessions.map(s => s.id || 0)) + 1 : 1;
    
    const newSession: PracticeSession = {
      ...session,
      id: newId
    };
    
    sessions.push(newSession);
    await this.db.push('/practice_sessions', sessions);
    return newId;
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

    let collections: Collection[] = [];
    try {
      collections = (await this.db.getData('/collections') as unknown) as Collection[];
    } catch {
      await this.db.push('/collections', [], false);
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
        await this.db.push('/collections', collections);
        return collectionData.id;
      }
      throw new Error('Collection not found');
    } else {
      // Insert new collection
      const newId = collections.length > 0 ? Math.max(...collections.map(c => c.id || 0)) + 1 : 1;
      const newCollection: Collection = {
        ...collectionData,
        id: newId,
        created_date: now,
        modified_date: now
      };
      
      collections.push(newCollection);
      await this.db.push('/collections', collections);
      return newId;
    }
  }

  async deleteCollection(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Remove the collection
    let collections: Collection[] = [];
    try {
      collections = (await this.db.getData('/collections') as unknown) as Collection[];
    } catch {
      return;
    }
    const filteredCollections = collections.filter(c => c.id !== id);
    await this.db.push('/collections', filteredCollections);

    // Remove all case-collection relationships for this collection
    let caseCollections: Array<{case_id: number, collection_id: number}> = [];
    try {
      caseCollections = (await this.db.getData('/case_collections') as unknown) as Array<{case_id: number, collection_id: number}>;
    } catch {
      return;
    }
    const filteredCaseCollections = caseCollections.filter(cc => cc.collection_id !== id);
    await this.db.push('/case_collections', filteredCaseCollections);

    // Update parent_collection_id for subcollections (set to null)
    const updatedCollections = filteredCollections.map(c => 
      c.parent_collection_id === id ? { ...c, parent_collection_id: undefined } : c
    );
    await this.db.push('/collections', updatedCollections);
  }

  async addCaseToCollection(caseId: number, collectionId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    let caseCollections: Array<{case_id: number, collection_id: number}> = [];
    try {
      caseCollections = (await this.db.getData('/case_collections') as unknown) as Array<{case_id: number, collection_id: number}>;
    } catch {
      await this.db.push('/case_collections', [], false);
      caseCollections = [];
    }

    // Check if relationship already exists
    const exists = caseCollections.some(cc => cc.case_id === caseId && cc.collection_id === collectionId);
    if (!exists) {
      caseCollections.push({ case_id: caseId, collection_id: collectionId });
      await this.db.push('/case_collections', caseCollections);
    }
  }

  async removeCaseFromCollection(caseId: number, collectionId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    let caseCollections: Array<{case_id: number, collection_id: number}> = [];
    try {
      caseCollections = (await this.db.getData('/case_collections') as unknown) as Array<{case_id: number, collection_id: number}>;
    } catch {
      return;
    }

    const filteredCaseCollections = caseCollections.filter(cc => 
      !(cc.case_id === caseId && cc.collection_id === collectionId)
    );
    await this.db.push('/case_collections', filteredCaseCollections);
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
}