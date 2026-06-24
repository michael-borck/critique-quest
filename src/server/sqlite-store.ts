import type { DB } from './db';
import type { SecretBox } from '../core/secret-box';
import type { Store, UsageStats } from '../core/store';
import { encryptApiKeys, decryptApiKeys } from '../core/api-keys';
import type { CaseStudy, Collection, AIUsage, PracticeSession, CaseFilters, UserPreferences } from '../shared/types';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  default_ai_provider: 'openai',
  default_ai_model: 'gpt-4',
  api_keys: {},
  default_generation_settings: {
    domain: 'Business',
    complexity: 'Intermediate',
    scenario_type: 'Problem-solving',
    length_preference: 'Medium',
  },
  default_home_page: 'generation',
  enable_practice_ai_analysis: false,
  enable_high_contrast: false,
};

interface CaseRow {
  id: number;
  title: string;
  domain: string;
  complexity: string;
  scenario_type: string;
  content: string;
  questions: string;
  answers: string | null;
  tags: string | null;
  is_favorite: number;
  word_count: number;
  usage_count: number;
  created_date: string;
  modified_date: string;
}

// SQLite-backed Store scoped to one user. Every query is filtered by user_id so
// a single database file isolates many accounts.
export class SqliteStore implements Store {
  constructor(private db: DB, private userId: number, private secretBox: SecretBox) {}

  async initialize(): Promise<void> {
    // Schema is created once when the database is opened (see ./db).
  }

  private rowToCase(row: CaseRow): CaseStudy {
    return {
      id: row.id,
      title: row.title,
      domain: row.domain,
      complexity: row.complexity as CaseStudy['complexity'],
      scenario_type: row.scenario_type as CaseStudy['scenario_type'],
      content: row.content,
      questions: row.questions,
      answers: row.answers ?? undefined,
      tags: row.tags ? JSON.parse(row.tags) : [],
      is_favorite: !!row.is_favorite,
      word_count: row.word_count,
      usage_count: row.usage_count,
      created_date: row.created_date,
      modified_date: row.modified_date,
      collection_ids: this.collectionIdsForCase(row.id),
    };
  }

  private collectionIdsForCase(caseId: number): number[] {
    return this.db
      .prepare('SELECT collection_id FROM case_collections WHERE user_id = ? AND case_id = ?')
      .all(this.userId, caseId)
      .map((r) => (r as { collection_id: number }).collection_id);
  }

  async getCases(filters?: CaseFilters): Promise<CaseStudy[]> {
    const rows = this.db
      .prepare('SELECT * FROM cases WHERE user_id = ? ORDER BY modified_date DESC')
      .all(this.userId) as CaseRow[];
    let cases = rows.map((r) => this.rowToCase(r));

    if (filters) {
      if (filters.domain) cases = cases.filter((c) => c.domain === filters.domain);
      if (filters.complexity) cases = cases.filter((c) => c.complexity === filters.complexity);
      if (filters.favorite) cases = cases.filter((c) => c.is_favorite);
      if (filters.tags && filters.tags.length > 0) {
        cases = cases.filter((c) => filters.tags!.some((t) => c.tags.includes(t)));
      }
    }
    return cases;
  }

  async saveCase(caseData: CaseStudy): Promise<number> {
    const now = new Date().toISOString();
    const tags = JSON.stringify(caseData.tags || []);

    if (caseData.id) {
      const result = this.db
        .prepare(
          `UPDATE cases SET title=?, domain=?, scenario_type=?, complexity=?, content=?, questions=?,
           answers=?, tags=?, is_favorite=?, word_count=?, usage_count=?, modified_date=?
           WHERE id=? AND user_id=?`,
        )
        .run(
          caseData.title, caseData.domain, caseData.scenario_type, caseData.complexity, caseData.content,
          caseData.questions, caseData.answers ?? null, tags, caseData.is_favorite ? 1 : 0,
          caseData.word_count ?? 0, caseData.usage_count ?? 0, now, caseData.id, this.userId,
        );
      if (result.changes === 0) throw new Error('Case not found');
      if (caseData.collection_ids) this.syncCaseCollections(caseData.id, caseData.collection_ids);
      return caseData.id;
    }

    const info = this.db
      .prepare(
        `INSERT INTO cases (user_id, title, domain, scenario_type, complexity, content, questions,
         answers, tags, is_favorite, word_count, usage_count, created_date, modified_date)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        this.userId, caseData.title, caseData.domain, caseData.scenario_type, caseData.complexity,
        caseData.content, caseData.questions, caseData.answers ?? null, tags, caseData.is_favorite ? 1 : 0,
        caseData.word_count ?? 0, caseData.usage_count ?? 0, now, now,
      );
    const newId = Number(info.lastInsertRowid);
    if (caseData.collection_ids) this.syncCaseCollections(newId, caseData.collection_ids);
    return newId;
  }

  private syncCaseCollections(caseId: number, collectionIds: number[]): void {
    this.db.prepare('DELETE FROM case_collections WHERE user_id = ? AND case_id = ?').run(this.userId, caseId);
    const insert = this.db.prepare('INSERT OR IGNORE INTO case_collections (user_id, case_id, collection_id) VALUES (?,?,?)');
    for (const cid of collectionIds) insert.run(this.userId, caseId, cid);
  }

  async deleteCase(id: number): Promise<void> {
    this.db.prepare('DELETE FROM cases WHERE id = ? AND user_id = ?').run(id, this.userId);
    this.db.prepare('DELETE FROM case_collections WHERE user_id = ? AND case_id = ?').run(this.userId, id);
  }

  async searchCases(query: string): Promise<CaseStudy[]> {
    const like = `%${query.toLowerCase()}%`;
    const rows = this.db
      .prepare(
        `SELECT * FROM cases WHERE user_id = ? AND (
           lower(title) LIKE ? OR lower(content) LIKE ? OR lower(questions) LIKE ?
         ) ORDER BY modified_date DESC`,
      )
      .all(this.userId, like, like, like) as CaseRow[];
    return rows.map((r) => this.rowToCase(r));
  }

  async getPreferences(): Promise<UserPreferences> {
    const row = this.db.prepare('SELECT data FROM preferences WHERE user_id = ?').get(this.userId) as
      | { data: string }
      | undefined;
    if (!row) return { ...DEFAULT_PREFERENCES };
    const prefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(row.data) } as UserPreferences;
    if (prefs.api_keys) prefs.api_keys = decryptApiKeys(prefs.api_keys, this.secretBox);
    return prefs;
  }

  async setPreference(key: string, value: unknown): Promise<void> {
    const current = await this.getRawPreferences();
    const storedValue =
      key === 'api_keys' && value && typeof value === 'object'
        ? encryptApiKeys(value as Record<string, string>, this.secretBox)
        : value;
    current[key] = storedValue;
    this.db
      .prepare('INSERT INTO preferences (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data')
      .run(this.userId, JSON.stringify(current));
  }

  // Preferences as stored (api_keys still encrypted), for read-modify-write.
  private async getRawPreferences(): Promise<Record<string, unknown>> {
    const row = this.db.prepare('SELECT data FROM preferences WHERE user_id = ?').get(this.userId) as
      | { data: string }
      | undefined;
    return row ? JSON.parse(row.data) : { ...DEFAULT_PREFERENCES };
  }

  async trackAIUsage(usage: AIUsage): Promise<void> {
    this.db
      .prepare('INSERT INTO ai_usage (user_id, provider, model, tokens_used, cost_estimate, timestamp) VALUES (?,?,?,?,?,?)')
      .run(this.userId, usage.provider, usage.model ?? null, usage.tokens_used ?? 0, usage.cost_estimate ?? 0, new Date().toISOString());
  }

  async getUsageStats(): Promise<UsageStats> {
    const rows = this.db.prepare('SELECT * FROM ai_usage WHERE user_id = ?').all(this.userId) as AIUsage[];
    const totalTokens = rows.reduce((s, u) => s + (u.tokens_used || 0), 0);
    const totalCost = rows.reduce((s, u) => s + (u.cost_estimate || 0), 0);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const session = rows.filter((u) => u.timestamp && new Date(u.timestamp) > oneHourAgo);
    const providerCounts = rows.reduce((acc, u) => {
      acc[u.provider] = (acc[u.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostUsedProvider =
      Object.entries(providerCounts).length > 0
        ? Object.entries(providerCounts).sort(([, a], [, b]) => b - a)[0][0]
        : 'None';
    return {
      totalTokens,
      totalCost,
      sessionTokens: session.reduce((s, u) => s + (u.tokens_used || 0), 0),
      sessionCost: session.reduce((s, u) => s + (u.cost_estimate || 0), 0),
      mostUsedProvider,
      sessionStart: oneHourAgo.toISOString(),
    };
  }

  async savePracticeSession(session: PracticeSession & { analysis?: unknown }): Promise<number> {
    const info = this.db
      .prepare('INSERT INTO practice_sessions (user_id, case_id, start_time, end_time, notes, analysis) VALUES (?,?,?,?,?,?)')
      .run(
        this.userId, session.case_id, session.start_time ?? null, session.end_time ?? null,
        session.notes ?? '', session.analysis ? JSON.stringify(session.analysis) : null,
      );
    return Number(info.lastInsertRowid);
  }

  async getPracticeSessions(caseId: number): Promise<PracticeSession[]> {
    const rows = this.db
      .prepare('SELECT * FROM practice_sessions WHERE user_id = ? AND case_id = ? ORDER BY start_time DESC')
      .all(this.userId, caseId) as Array<PracticeSession & { analysis: string | null }>;
    return rows.map((r) => ({
      id: r.id,
      case_id: r.case_id,
      start_time: r.start_time,
      end_time: r.end_time,
      notes: r.notes,
      ...(r.analysis ? { analysis: JSON.parse(r.analysis) } : {}),
    }));
  }

  async getCollections(): Promise<Collection[]> {
    const rows = this.db
      .prepare('SELECT * FROM collections WHERE user_id = ? ORDER BY modified_date DESC')
      .all(this.userId) as Collection[];
    for (const c of rows) {
      const countRow = this.db
        .prepare('SELECT COUNT(*) AS n FROM case_collections WHERE user_id = ? AND collection_id = ?')
        .get(this.userId, c.id) as { n: number };
      c.case_count = countRow.n;
      const subRow = this.db
        .prepare('SELECT COUNT(*) AS n FROM collections WHERE user_id = ? AND parent_collection_id = ?')
        .get(this.userId, c.id) as { n: number };
      c.subcollection_count = subRow.n;
    }
    return rows;
  }

  async saveCollection(collectionData: Collection): Promise<number> {
    const now = new Date().toISOString();
    if (collectionData.id) {
      const result = this.db
        .prepare('UPDATE collections SET name=?, description=?, color=?, parent_collection_id=?, modified_date=? WHERE id=? AND user_id=?')
        .run(
          collectionData.name, collectionData.description ?? null, collectionData.color ?? null,
          collectionData.parent_collection_id ?? null, now, collectionData.id, this.userId,
        );
      if (result.changes === 0) throw new Error('Collection not found');
      return collectionData.id;
    }
    const info = this.db
      .prepare('INSERT INTO collections (user_id, name, description, color, parent_collection_id, created_date, modified_date) VALUES (?,?,?,?,?,?,?)')
      .run(
        this.userId, collectionData.name, collectionData.description ?? null, collectionData.color ?? null,
        collectionData.parent_collection_id ?? null, now, now,
      );
    return Number(info.lastInsertRowid);
  }

  async deleteCollection(id: number): Promise<void> {
    this.db.prepare('DELETE FROM collections WHERE id = ? AND user_id = ?').run(id, this.userId);
    this.db.prepare('DELETE FROM case_collections WHERE user_id = ? AND collection_id = ?').run(this.userId, id);
    this.db.prepare('UPDATE collections SET parent_collection_id = NULL WHERE user_id = ? AND parent_collection_id = ?').run(this.userId, id);
  }

  async addCaseToCollection(caseId: number, collectionId: number): Promise<void> {
    this.db
      .prepare('INSERT OR IGNORE INTO case_collections (user_id, case_id, collection_id) VALUES (?,?,?)')
      .run(this.userId, caseId, collectionId);
  }

  async removeCaseFromCollection(caseId: number, collectionId: number): Promise<void> {
    this.db
      .prepare('DELETE FROM case_collections WHERE user_id = ? AND case_id = ? AND collection_id = ?')
      .run(this.userId, caseId, collectionId);
  }

  async getCasesByCollection(collectionId: number): Promise<CaseStudy[]> {
    const rows = this.db
      .prepare(
        `SELECT c.* FROM cases c
         JOIN case_collections cc ON cc.case_id = c.id
         WHERE c.user_id = ? AND cc.user_id = ? AND cc.collection_id = ?
         ORDER BY c.modified_date DESC`,
      )
      .all(this.userId, this.userId, collectionId) as CaseRow[];
    return rows.map((r) => this.rowToCase(r));
  }

  async getCollectionsByCase(caseId: number): Promise<Collection[]> {
    const rows = this.db
      .prepare(
        `SELECT col.* FROM collections col
         JOIN case_collections cc ON cc.collection_id = col.id
         WHERE col.user_id = ? AND cc.user_id = ? AND cc.case_id = ?`,
      )
      .all(this.userId, this.userId, caseId) as Collection[];
    return rows;
  }
}
