import { JsonDB, Config } from 'node-json-db';
import { join } from 'path';
import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import type { CaseStudy, AIUsage, PracticeSession } from '../shared/types';

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
    } catch (error) {
      console.error('Database setup error:', error);
      // Initialize with empty database
      await this.db.push('/', {
        cases: [],
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
}