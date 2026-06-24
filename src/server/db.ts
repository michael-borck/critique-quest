import Database from 'better-sqlite3';

export type DB = Database.Database;

// Opens the SQLite database and applies the schema. Safe to call repeatedly
// (CREATE TABLE IF NOT EXISTS). All user-owned rows carry a user_id so a single
// database serves many accounts with full per-user isolation.
export function openDatabase(path: string): DB {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

export function initSchema(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      domain TEXT,
      complexity TEXT,
      scenario_type TEXT,
      content TEXT,
      questions TEXT,
      answers TEXT,
      tags TEXT,
      is_favorite INTEGER DEFAULT 0,
      word_count INTEGER DEFAULT 0,
      usage_count INTEGER DEFAULT 0,
      created_date TEXT,
      modified_date TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id);

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      parent_collection_id INTEGER,
      created_date TEXT,
      modified_date TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);

    CREATE TABLE IF NOT EXISTS case_collections (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      case_id INTEGER NOT NULL,
      collection_id INTEGER NOT NULL,
      PRIMARY KEY (case_id, collection_id)
    );

    CREATE TABLE IF NOT EXISTS preferences (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT,
      model TEXT,
      tokens_used INTEGER,
      cost_estimate REAL,
      timestamp TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_usage_user ON ai_usage(user_id);

    CREATE TABLE IF NOT EXISTS practice_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      case_id INTEGER,
      start_time TEXT,
      end_time TEXT,
      notes TEXT,
      analysis TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_practice_user ON practice_sessions(user_id);
  `);
}
