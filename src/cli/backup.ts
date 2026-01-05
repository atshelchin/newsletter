#!/usr/bin/env bun
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

// Database path: same logic as db.ts
const dbPath = process.env.NODE_ENV === "production"
  ? "/app/data/newsletter.db"
  : "newsletter.db";

// Default backup directory
const defaultBackupDir = process.env.NODE_ENV === "production"
  ? "/app/data/backups"
  : "./backups";

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function backup(outputPath?: string): void {
  // Check if source database exists
  if (!existsSync(dbPath)) {
    console.error(`Error: Database not found at ${dbPath}`);
    process.exit(1);
  }

  // Determine output path
  const timestamp = formatDate(new Date());
  const backupFileName = `newsletter_${timestamp}.db`;
  const backupPath = outputPath || join(defaultBackupDir, backupFileName);

  // Ensure backup directory exists
  const backupDir = dirname(backupPath);
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  console.log(`Starting hot backup...`);
  console.log(`Source: ${dbPath}`);
  console.log(`Target: ${backupPath}`);

  try {
    // Open source database
    const sourceDb = new Database(dbPath, { readonly: true });

    // Use SQLite's backup API via VACUUM INTO for hot backup
    // This is safe to run while the database is in use
    sourceDb.run(`VACUUM INTO '${backupPath}'`);
    sourceDb.close();

    console.log(`\n✓ Backup completed successfully!`);
    console.log(`  File: ${backupPath}`);

    // Show backup file size
    const file = Bun.file(backupPath);
    const sizeKB = (file.size / 1024).toFixed(2);
    console.log(`  Size: ${sizeKB} KB`);
  } catch (error) {
    console.error(`\nError during backup:`, error);
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Newsletter Database Backup Tool

Usage:
  bun run backup [output-path]

Options:
  -h, --help    Show this help message

Examples:
  bun run backup                          # Backup to default location
  bun run backup ./my-backup.db           # Backup to specific file
  bun run backup /path/to/backup/dir/     # Backup to specific directory

Environment:
  NODE_ENV=production    Uses /app/data/newsletter.db as source
  NODE_ENV=development   Uses ./newsletter.db as source
`);
  process.exit(0);
}

// Run backup
const outputPath = args[0];
backup(outputPath);
