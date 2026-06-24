# --- Build stage: compile the server + web bundle ---
FROM node:22-bookworm-slim AS build
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

# --- Runtime stage ---
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8787 \
    DATA_DIR=/data

# node_modules already has the compiled better-sqlite3 binary from the build stage.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

RUN mkdir -p /data
VOLUME /data
EXPOSE 8787

CMD ["node", "dist/server/index.js"]
