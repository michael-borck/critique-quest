# Self-Hosting CritiqueQuest

CritiqueQuest can run as a multi-user web app you host yourself, in addition to
the desktop app. Both share the same core; the server stores each user's library
in SQLite with full per-user isolation.

## Quick start (Docker Compose)

```bash
# 1. Configure
cp .env.example .env
# set CRITIQUEQUEST_SECRET — generate one with:
openssl rand -hex 32

# 2. Run
docker compose up -d --build

# 3. Open http://localhost:8787 and create the first account
```

The first account can always self-register. After that, additional sign-ups are
disabled unless you set `CRITIQUEQUEST_ALLOW_REGISTRATION=true`.

Data (the SQLite database and generated exports) lives in the `cq-data` volume,
so it survives container restarts and upgrades.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `CRITIQUEQUEST_SECRET` | — (required) | Encrypts stored API keys (AES-256-GCM) and signs session cookies. |
| `CRITIQUEQUEST_ALLOW_REGISTRATION` | `false` | `true` opens sign-ups to everyone; otherwise only the first account. |
| `PORT` | `8787` | HTTP port. |
| `DATA_DIR` | `/data` | Where the SQLite db and exports are written. |
| `CRITIQUEQUEST_COOKIE_SECRET` | falls back to `CRITIQUEQUEST_SECRET` | Override the cookie signing key. |
| `NODE_ENV` | — | `production` marks the session cookie `Secure` and makes `CRITIQUEQUEST_SECRET` required. |
| `COOKIE_SECURE` | — | Force the session cookie `Secure` regardless of `NODE_ENV`. |

### System-wide AI keys (optional)

Each user sets their own API keys in Settings. To provide an instance-wide
default that users fall back to when they haven't set their own, pass any of:
`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `OLLAMA_API_KEY`,
`OPENAI_BASE_URL`.

## Local AI with Ollama

Run the bundled Ollama service alongside the app:

```bash
docker compose --profile ollama up -d --build
docker compose exec ollama ollama pull llama3
```

Then in **Settings → AI Provider**, choose **Ollama** with endpoint
`http://ollama:11434` (the app and Ollama share the compose network).

## Running without Docker

```bash
npm ci
npm run build:server   # compiles the server + core to dist/
npm run build:web      # builds the web client to dist/web
DATA_DIR=./data CRITIQUEQUEST_SECRET=$(openssl rand -hex 32) npm run start:server
```

## Security

- **TLS is required in production.** Set `NODE_ENV=production` (or
  `COOKIE_SECURE=true`) and terminate HTTPS at a reverse proxy (Caddy, nginx,
  Traefik). The session cookie is marked `Secure`, so a browser refuses to send
  it over plain HTTP — without TLS the app will appear unable to stay logged in.
- **`CRITIQUEQUEST_SECRET` is mandatory in production** — the server refuses to
  start without it. It encrypts stored API keys (AES-256-GCM) and signs session
  cookies. Rotating it invalidates existing keys (users must re-enter them).
- API keys are resolved server-side for generation/analysis and are not
  re-sent on every request; only the Settings save and the "Test connection"
  button transmit a key, so keep those behind HTTPS.
- The server rate-limits login and registration attempts.
