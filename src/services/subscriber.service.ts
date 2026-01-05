/**
 * Subscriber Service
 * Handles all database operations for newsletter subscriptions
 */

import { db, type Subscriber, type SubscribeRequest, type UnsubscribeRequest } from '../db';
import { isValidEmail, normalizeEmail } from '../utils/validation';

export type SubscribeResult =
  | { success: true; message: string; isResubscribe?: boolean }
  | { success: false; error: string; code: string };

export type UnsubscribeResult =
  | { success: true; message: string }
  | { success: false; message: string };

export interface SourceStats {
  total: number;
  subscribed: number;
  unsubscribed: number;
}

export interface StatsResult {
  success: true;
  source?: string;
  stats: SourceStats | Array<SourceStats & { source: string }>;
}

/**
 * Find subscriber by email and source
 */
function findByEmailAndSource(email: string, source: string): Pick<Subscriber, 'id' | 'status'> | null {
  return db
    .query('SELECT id, status FROM subscribers WHERE email = ? AND source = ?')
    .get(normalizeEmail(email), source) as Pick<Subscriber, 'id' | 'status'> | null;
}

/**
 * Update existing subscriber to re-subscribe
 */
function resubscribe(id: number, request: SubscribeRequest): void {
  const { locale, device, referrer } = request;

  db.run(
    `UPDATE subscribers SET
      status = 'subscribed',
      locale_language = ?,
      locale_timezone = ?,
      locale_utc_offset = ?,
      device_type = ?,
      device_platform = ?,
      device_browser = ?,
      device_screen_width = ?,
      device_screen_height = ?,
      device_touch_support = ?,
      user_agent = ?,
      referrer = ?,
      updated_at = datetime('now')
    WHERE id = ?`,
    [
      locale?.language ?? null,
      locale?.timezone ?? null,
      locale?.utcOffset ?? null,
      device?.deviceType ?? null,
      device?.platform ?? null,
      device?.browser ?? null,
      device?.screenWidth ?? null,
      device?.screenHeight ?? null,
      device?.touchSupport ? 1 : 0,
      device?.userAgent ?? null,
      referrer ?? null,
      id,
    ]
  );
}

/**
 * Insert new subscriber
 */
function insertSubscriber(request: SubscribeRequest): void {
  const { email, source, locale, device, referrer } = request;

  db.run(
    `INSERT INTO subscribers (
      email, source, status,
      locale_language, locale_timezone, locale_utc_offset,
      device_type, device_platform, device_browser,
      device_screen_width, device_screen_height, device_touch_support,
      user_agent, referrer
    ) VALUES (?, ?, 'subscribed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      normalizeEmail(email),
      source,
      locale?.language ?? null,
      locale?.timezone ?? null,
      locale?.utcOffset ?? null,
      device?.deviceType ?? null,
      device?.platform ?? null,
      device?.browser ?? null,
      device?.screenWidth ?? null,
      device?.screenHeight ?? null,
      device?.touchSupport ? 1 : 0,
      device?.userAgent ?? null,
      referrer ?? null,
    ]
  );
}

/**
 * Subscribe a user to the newsletter
 */
export function subscribe(request: SubscribeRequest): SubscribeResult {
  const { email, source } = request;

  // Validate email
  if (!isValidEmail(email)) {
    return {
      success: false,
      error: 'Invalid email address',
      code: 'INVALID_EMAIL',
    };
  }

  try {
    const existing = findByEmailAndSource(email, source);

    if (existing) {
      if (existing.status === 'subscribed') {
        return {
          success: false,
          error: 'This email is already subscribed',
          code: 'ALREADY_SUBSCRIBED',
        };
      }

      // Re-subscribe
      resubscribe(existing.id, request);
      return {
        success: true,
        message: 'Successfully re-subscribed!',
        isResubscribe: true,
      };
    }

    // New subscriber
    insertSubscriber(request);
    return {
      success: true,
      message: 'Successfully subscribed!',
    };
  } catch (error) {
    console.error('[SubscriberService.subscribe] Error:', error);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
      code: 'SERVER_ERROR',
    };
  }
}

/**
 * Unsubscribe a user from the newsletter
 */
export function unsubscribe(request: UnsubscribeRequest): UnsubscribeResult {
  const { email, source } = request;

  // Validate email
  if (!isValidEmail(email)) {
    return {
      success: false,
      message: 'Invalid email address',
    };
  }

  try {
    const result = db.run(
      `UPDATE subscribers SET
        status = 'unsubscribed',
        updated_at = datetime('now')
      WHERE email = ? AND source = ?`,
      [normalizeEmail(email), source]
    );

    if (result.changes === 0) {
      return {
        success: true,
        message: "Email not found in our list, but you're all set!",
      };
    }

    return {
      success: true,
      message: 'Successfully unsubscribed.',
    };
  } catch (error) {
    console.error('[SubscriberService.unsubscribe] Error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    };
  }
}

/**
 * Get statistics for all sources or a specific source
 */
export function getStats(source?: string): StatsResult | { success: false; error: string } {
  try {
    if (source) {
      const stats = db
        .query(
          `SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END) as subscribed,
            SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
          FROM subscribers WHERE source = ?`
        )
        .get(source) as SourceStats;

      return {
        success: true,
        source,
        stats,
      };
    }

    // All sources
    const stats = db
      .query(
        `SELECT
          source,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'subscribed' THEN 1 ELSE 0 END) as subscribed,
          SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
        FROM subscribers GROUP BY source`
      )
      .all() as Array<SourceStats & { source: string }>;

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error('[SubscriberService.getStats] Error:', error);
    return {
      success: false,
      error: 'Failed to fetch stats',
    };
  }
}
