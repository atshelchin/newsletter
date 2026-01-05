# Use official Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Final stage
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

# Create data directory for SQLite and set ownership
RUN mkdir -p /app/data && chown -R bun:bun /app/data

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Run the app
USER bun
CMD ["bun", "run", "src/index.ts"]
