/**
 * Admin Routes
 * Protected endpoints for database management
 */

import { Elysia } from 'elysia';
import { Database } from 'bun:sqlite';

const ADMIN_KEY = process.env.ADMIN_KEY;

const dbPath = process.env.NODE_ENV === 'production'
  ? '/app/data/newsletter.db'
  : 'newsletter.db';

export const adminRoute = new Elysia()
  .get('/admin/download-db', ({ query, set }) => {
    // Check if ADMIN_KEY is configured
    if (!ADMIN_KEY) {
      set.status = 503;
      return { error: 'Admin access not configured' };
    }

    // Validate key
    if (query.key !== ADMIN_KEY) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    try {
      // Create a safe backup using VACUUM INTO
      const tempPath = `/tmp/newsletter_download_${Date.now()}.db`;
      const sourceDb = new Database(dbPath, { readonly: true });
      sourceDb.run(`VACUUM INTO '${tempPath}'`);
      sourceDb.close();

      // Read the backup file
      const file = Bun.file(tempPath);

      // Set headers for download
      set.headers['Content-Type'] = 'application/x-sqlite3';
      set.headers['Content-Disposition'] = `attachment; filename="newsletter_${new Date().toISOString().slice(0, 10)}.db"`;

      // Clean up temp file after a delay
      setTimeout(() => {
        Bun.file(tempPath).exists().then(exists => {
          if (exists) {
            require('fs').unlinkSync(tempPath);
          }
        });
      }, 5000);

      return file;
    } catch (error) {
      console.error('[Admin.downloadDb] Error:', error);
      set.status = 500;
      return { error: 'Failed to create database backup' };
    }
  });
