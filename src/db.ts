import { Database } from "bun:sqlite";

// Database path: use /app/data in production (Docker), otherwise current directory
const dbPath = process.env.NODE_ENV === "production"
  ? "/app/data/newsletter.db"
  : "newsletter.db";

// Initialize database
const db = new Database(dbPath);

// Create subscribers table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT DEFAULT 'subscribed' CHECK(status IN ('subscribed', 'unsubscribed')),
    locale_language TEXT,
    locale_timezone TEXT,
    locale_utc_offset INTEGER,
    device_type TEXT,
    device_platform TEXT,
    device_browser TEXT,
    device_screen_width INTEGER,
    device_screen_height INTEGER,
    device_touch_support INTEGER,
    user_agent TEXT,
    referrer TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(email, source)
  )
`);

// Migrate: if old table has UNIQUE on email only, rebuild with UNIQUE(email, source)
const tableInfo = db.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='subscribers'").get() as { sql: string } | null;
if (tableInfo?.sql && !tableInfo.sql.includes('UNIQUE(email, source)') && !tableInfo.sql.includes('UNIQUE (email, source)')) {
  console.log('[DB Migration] Rebuilding subscribers table: UNIQUE(email) -> UNIQUE(email, source)');
  db.run('BEGIN TRANSACTION');
  try {
    db.run('ALTER TABLE subscribers RENAME TO subscribers_old');
    db.run(`
      CREATE TABLE subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        source TEXT NOT NULL,
        status TEXT DEFAULT 'subscribed' CHECK(status IN ('subscribed', 'unsubscribed')),
        locale_language TEXT,
        locale_timezone TEXT,
        locale_utc_offset INTEGER,
        device_type TEXT,
        device_platform TEXT,
        device_browser TEXT,
        device_screen_width INTEGER,
        device_screen_height INTEGER,
        device_touch_support INTEGER,
        user_agent TEXT,
        referrer TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(email, source)
      )
    `);
    db.run('INSERT INTO subscribers SELECT * FROM subscribers_old');
    db.run('DROP TABLE subscribers_old');
    db.run('COMMIT');
    console.log('[DB Migration] Done');
  } catch (e) {
    db.run('ROLLBACK');
    console.error('[DB Migration] Failed, rolled back:', e);
  }
}

// Create indexes
db.run(`CREATE INDEX IF NOT EXISTS idx_email ON subscribers(email)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_source ON subscribers(source)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_status ON subscribers(status)`);

export { db };

// Types
export interface Subscriber {
  id: number;
  email: string;
  source: string;
  status: "subscribed" | "unsubscribed";
  locale_language: string | null;
  locale_timezone: string | null;
  locale_utc_offset: number | null;
  device_type: string | null;
  device_platform: string | null;
  device_browser: string | null;
  device_screen_width: number | null;
  device_screen_height: number | null;
  device_touch_support: number | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscribeRequest {
  email: string;
  source: string;
  locale?: {
    language: string;
    timezone: string;
    utcOffset: number;
  };
  device?: {
    userAgent: string;
    deviceType: string;
    platform: string;
    browser: string;
    screenWidth: number;
    screenHeight: number;
    touchSupport: boolean;
  };
  referrer?: string;
}

export interface UnsubscribeRequest {
  email: string;
  source: string;
}
