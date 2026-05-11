#!/bin/bash
# View all contents of newsletter.db
DB="${1:-./newsletter.db}"

if [ ! -f "$DB" ]; then
  echo "Database not found: $DB"
  exit 1
fi

echo "=== Tables ==="
sqlite3 "$DB" ".tables"

echo ""
echo "=== Schema ==="
sqlite3 "$DB" ".schema"

echo ""
echo "=== Subscribers (all rows) ==="
sqlite3 -header -column "$DB" "SELECT * FROM subscribers;"

echo ""
echo "=== Stats ==="
sqlite3 -header -column "$DB" "
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN status='subscribed' THEN 1 ELSE 0 END) as subscribed,
  SUM(CASE WHEN status='unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
FROM subscribers;
"
