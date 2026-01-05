#!/bin/bash
# Download production database for local viewing
# Usage: ./scripts/download-db.sh [server] [path]

SERVER="${1:-root@你的服务器IP}"
REMOTE_PATH="${2:-/opt/newsletter/data/newsletter.db}"
LOCAL_PATH="./newsletter-$(date +%Y%m%d_%H%M%S).db"

echo "Downloading database from ${SERVER}..."
scp "${SERVER}:${REMOTE_PATH}" "${LOCAL_PATH}"

if [ $? -eq 0 ]; then
  echo "Downloaded to: ${LOCAL_PATH}"
  echo "Open with: open ${LOCAL_PATH}  # or use your preferred SQLite client"
else
  echo "Download failed"
  exit 1
fi
