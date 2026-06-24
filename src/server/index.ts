import { join } from 'path';
import { mkdirSync } from 'fs';
import { openDatabase } from './db';
import { EnvSecretBox } from './secret-box';
import { buildServer } from './server';

// Entry point for the self-hosted server. Configuration via environment:
//   PORT                          (default 8787)
//   DATA_DIR                      where the SQLite db + exports live (default ./data)
//   CRITIQUEQUEST_SECRET          key used to encrypt stored API keys + sign cookies
//   CRITIQUEQUEST_COOKIE_SECRET   override cookie signing secret (defaults to *_SECRET)
//   CRITIQUEQUEST_ALLOW_REGISTRATION  'true' to allow open sign-ups (default: first user only)
async function main(): Promise<void> {
  const port = Number(process.env.PORT || 8787);
  const dataDir = process.env.DATA_DIR || join(process.cwd(), 'data');
  mkdirSync(dataDir, { recursive: true });

  const secret = process.env.CRITIQUEQUEST_SECRET;
  if (!secret) {
    console.warn('[critiquequest] CRITIQUEQUEST_SECRET is not set — API keys will be stored unencrypted and sessions use a weak cookie secret. Set it in production.');
  }
  const cookieSecret = process.env.CRITIQUEQUEST_COOKIE_SECRET || secret || 'insecure-dev-cookie-secret';

  const db = openDatabase(join(dataDir, 'critiquequest.db'));
  const secretBox = new EnvSecretBox(secret);

  // The built web client; served as static files with SPA fallback.
  const distDir = process.env.WEB_DIST || join(__dirname, '../renderer');

  const app = buildServer({
    db,
    dataDir,
    distDir,
    secretBox,
    cookieSecret,
    allowRegistration: process.env.CRITIQUEQUEST_ALLOW_REGISTRATION === 'true',
  });

  await app.listen({ port, host: '0.0.0.0' });
  console.log(`[critiquequest] server listening on http://0.0.0.0:${port}`);
}

main().catch((err) => {
  console.error('[critiquequest] failed to start:', err);
  process.exit(1);
});
