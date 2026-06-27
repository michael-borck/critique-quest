import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import { existsSync, readFileSync } from 'fs';
import { basename, extname } from 'path';
import type { DB } from './db';
import type { SecretBox } from '../core/secret-box';
import { AIService, FileService } from '../core';
import { RPC_METHODS, makeContext } from './rpc';
import {
  authenticate, createSession, createUser, countUsers, deleteSession, getSessionUser, User,
} from './auth';

const SESSION_COOKIE = 'cqsession';

export interface ServerOptions {
  db: DB;
  dataDir: string;
  distDir: string;       // built renderer to serve
  secretBox: SecretBox;
  cookieSecret: string;
  allowRegistration: boolean;
  secureCookie: boolean;
}

export function buildServer(opts: ServerOptions): FastifyInstance {
  const app = Fastify({ logger: false });
  const ai = new AIService();
  const files = new FileService({ dataDir: opts.dataDir });

  app.register(cookie, { secret: opts.cookieSecret });
  // Global per-IP request cap; auth routes tighten this further below.
  app.register(rateLimit, { max: 200, timeWindow: '1 minute' });

  const currentUser = (req: FastifyRequest): User | null => {
    const raw = req.cookies[SESSION_COOKIE];
    if (!raw) return null;
    const unsigned = req.unsignCookie(raw);
    if (!unsigned.valid || !unsigned.value) return null;
    return getSessionUser(opts.db, unsigned.value);
  };

  const setSessionCookie = (reply: FastifyReply, token: string) => {
    reply.setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: opts.secureCookie,
      sameSite: 'lax',
      signed: true,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
  };

  // --- Auth routes ---
  app.post('/api/auth/register', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (req, reply) => {
    const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
    if (!username || !password) return reply.code(400).send({ error: 'username and password required' });
    if (password.length < 8) return reply.code(400).send({ error: 'Password must be at least 8 characters' });
    // Registration is open only if explicitly allowed, or for the very first
    // account (so a fresh instance can be bootstrapped).
    if (!opts.allowRegistration && countUsers(opts.db) > 0) {
      return reply.code(403).send({ error: 'Registration is disabled' });
    }
    try {
      const user = createUser(opts.db, username, password);
      setSessionCookie(reply, createSession(opts.db, user.id));
      return { username: user.username };
    } catch (e) {
      return reply.code(409).send({ error: e instanceof Error ? e.message : 'Registration failed' });
    }
  });

  app.post('/api/auth/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (req, reply) => {
    const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
    if (!username || !password) return reply.code(400).send({ error: 'username and password required' });
    const user = authenticate(opts.db, username, password);
    if (!user) return reply.code(401).send({ error: 'Invalid username or password' });
    setSessionCookie(reply, createSession(opts.db, user.id));
    return { username: user.username };
  });

  app.post('/api/auth/logout', async (req, reply) => {
    const raw = req.cookies[SESSION_COOKIE];
    const unsigned = raw ? req.unsignCookie(raw) : null;
    if (unsigned?.valid && unsigned.value) deleteSession(opts.db, unsigned.value);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  });

  app.get('/api/auth/me', async (req, reply) => {
    const user = currentUser(req);
    if (!user) return reply.code(401).send({ error: 'Not authenticated' });
    return { username: user.username };
  });

  // --- RPC: the HTTP mirror of the Electron IPC channels ---
  app.post('/api/rpc', async (req, reply) => {
    const user = currentUser(req);
    if (!user) return reply.code(401).send({ error: 'Not authenticated' });

    const { method, args } = (req.body ?? {}) as { method?: string; args?: unknown[] };
    if (!method || !Object.prototype.hasOwnProperty.call(RPC_METHODS, method)) {
      return reply.code(400).send({ error: `Unknown method: ${method}` });
    }
    try {
      const ctx = makeContext(opts.db, user.id, opts.secretBox, ai, files);
      const result = await RPC_METHODS[method](ctx, args ?? []);
      return { result };
    } catch (e) {
      req.log.error(e);
      return reply.code(500).send({ error: e instanceof Error ? e.message : 'Request failed' });
    }
  });

  // --- File export: generate server-side, stream back as a download ---
  const EXPORT_MIME: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.html': 'text/html',
    '.rtf': 'application/rtf',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.md': 'text/markdown',
  };

  app.post('/api/export', async (req, reply) => {
    const user = currentUser(req);
    if (!user) return reply.code(401).send({ error: 'Not authenticated' });
    const body = (req.body ?? {}) as {
      kind?: string; format?: string; caseData?: unknown; caseStudies?: unknown; collections?: unknown; filename?: string;
    };
    try {
      let path: string;
      if (body.kind === 'bulk') {
        path = await files.exportBulkCases(body.caseStudies as never, body.format as string);
      } else if (body.kind === 'bundle') {
        path = await files.exportBundle(body.collections as never, body.caseStudies as never, body.filename as string);
      } else {
        path = await files.exportCase(body.caseData as never, body.format as string);
      }
      const name = basename(path);
      reply.header('Content-Disposition', `attachment; filename="${name}"`);
      reply.type(EXPORT_MIME[extname(path).toLowerCase()] || 'application/octet-stream');
      return reply.send(readFileSync(path));
    } catch (e) {
      req.log.error(e);
      return reply.code(500).send({ error: e instanceof Error ? e.message : 'Export failed' });
    }
  });

  // --- Static renderer + SPA fallback ---
  if (existsSync(opts.distDir)) {
    app.register(fastifyStatic, { root: opts.distDir, prefix: '/' });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/')) return reply.code(404).send({ error: 'Not found' });
      return reply.sendFile('index.html');
    });
  }

  return app;
}
