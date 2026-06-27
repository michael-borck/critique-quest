import { describe, it, expect, beforeEach } from 'vitest';
import { openDatabase, type DB } from './db';
import { SqliteStore } from './sqlite-store';
import { EnvSecretBox } from './secret-box';
import type { CaseStudy } from '../shared/types';

const box = new EnvSecretBox('unit-test-secret');

function addUser(db: DB, name: string): number {
  const info = db
    .prepare('INSERT INTO users (username, password_hash, created_at) VALUES (?,?,?)')
    .run(name, 'x', '1970-01-01T00:00:00.000Z');
  return Number(info.lastInsertRowid);
}

const sampleCase = (title: string): CaseStudy => ({
  title,
  domain: 'Business',
  complexity: 'Intermediate',
  scenario_type: 'Problem-solving',
  content: 'content here',
  questions: 'q',
  tags: ['a', 'b'],
  is_favorite: false,
  word_count: 2,
  usage_count: 0,
});

describe('SqliteStore', () => {
  let db: DB;
  let alice: SqliteStore;
  let bob: SqliteStore;

  beforeEach(() => {
    db = openDatabase(':memory:');
    alice = new SqliteStore(db, addUser(db, 'alice'), box);
    bob = new SqliteStore(db, addUser(db, 'bob'), box);
  });

  it('isolates cases between users', async () => {
    await alice.saveCase(sampleCase('Alice case'));
    expect((await alice.getCases()).map((c) => c.title)).toEqual(['Alice case']);
    expect(await bob.getCases()).toEqual([]);
  });

  it('round-trips a case and updates it', async () => {
    const id = await alice.saveCase(sampleCase('v1'));
    await alice.saveCase({ ...sampleCase('v2'), id });
    const cases = await alice.getCases();
    expect(cases).toHaveLength(1);
    expect(cases[0].title).toBe('v2');
    expect(cases[0].tags).toEqual(['a', 'b']);
  });

  it('never returns stored api key values (only presence) and merges partial saves', async () => {
    await alice.setPreference('api_keys', { openai: 'sk-secret', anthropic: 'sk-ant' });
    const prefs = await alice.getPreferences();
    // Values are never sent to the client.
    expect(prefs.api_keys).toEqual({});
    expect(prefs.api_keys_configured?.openai).toBe(true);
    expect(prefs.api_keys_configured?.anthropic).toBe(true);
    // The plaintext never reaches the stored row.
    const stored = db.prepare('SELECT data FROM preferences WHERE user_id = 1').get() as { data: string };
    expect(stored.data).not.toContain('sk-secret');
    expect(stored.data).not.toContain('sk-ant');
    // A partial save (only a newly-typed key) preserves the existing keys.
    await alice.setPreference('api_keys', { google: 'sk-goog' });
    const prefs2 = await alice.getPreferences();
    expect(prefs2.api_keys_configured?.google).toBe(true);
    expect(prefs2.api_keys_configured?.openai).toBe(true);
    expect(prefs2.api_keys_configured?.anthropic).toBe(true);
  });

  it('scopes search and collections per user', async () => {
    await alice.saveCase(sampleCase('Findable'));
    expect(await bob.searchCases('Findable')).toEqual([]);
    expect((await alice.searchCases('findable')).map((c) => c.title)).toEqual(['Findable']);
  });
});
