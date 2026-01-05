# Newsletter Subscription API

A newsletter subscription service built with Elysia and Bun runtime.

## Development

```bash
bun install
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## Production with Docker

```bash
docker compose up -d
```

The service runs on port 3000 with SQLite data persisted in `./data`.

## Auto Deployment

Push a version tag to trigger automatic deployment:

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Target server IP or domain |
| `SERVER_USER` | SSH username |
| `SERVER_SSH_KEY` | SSH private key |
| `SERVER_PORT` | SSH port (optional, default 22) |
| `DEPLOY_PATH` | Deployment directory, e.g. `/opt/newsletter` |

## Database Backup

Hot backup without service interruption:

```bash
# Local
bun run backup

# In Docker
docker exec newsletter-api bun run backup
```

Backups are saved to `./backups/` (local) or `/app/data/backups/` (Docker).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/subscribe` | Subscribe email |
| POST | `/unsubscribe` | Unsubscribe email |
| GET | `/stats` | Subscription statistics |
