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

  it('encrypts api keys at rest but returns them decrypted', async () => {
    await alice.setPreference('api_keys', { openai: 'sk-secret' });
    const prefs = await alice.getPreferences();
    expect(prefs.api_keys.openai).toBe('sk-secret');
    const stored = db.prepare('SELECT data FROM preferences WHERE user_id = 1').get() as { data: string };
    expect(stored.data).not.toContain('sk-secret');
  });

  it('scopes search and collections per user', async () => {
    await alice.saveCase(sampleCase('Findable'));
    expect(await bob.searchCases('Findable')).toEqual([]);
    expect((await alice.searchCases('findable')).map((c) => c.title)).toEqual(['Findable']);
  });
});
