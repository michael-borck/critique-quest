# --- Build stage: compile the server + web bundle ---
FROM node:24-bookworm-slim AS build
WORKDIR /app

# Build tools for native modules (better-sqlite3 falls back to source if no
# prebuilt is available). Skip the Electron binary download — not used server-side.
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:server && npm run build:web

# --- Production dependencies stage: install only runtime deps (incl. the
# natively-built better-sqlite3), without the Electron/Vite/ESLint toolchain). ---
FROM node:24-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Runtime stage: lean image, no build tools, runs as a non-root user. ---
FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8787 \
    DATA_DIR=/data

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./package.json

RUN groupadd -r app && useradd -r -g app -d /app app \
    && mkdir -p /data \
    && chown -R app:app /app /data
USER app

VOLUME /data
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||8787)+'/api/auth/me').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/index.js"]
