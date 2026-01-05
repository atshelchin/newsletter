import { Database } from "bun:sqlite";

// Initialize database
const db = new Database("newsletter.db");

// Create subscribers table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
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
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

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
