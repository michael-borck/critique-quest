import { describe, it, expect } from 'vitest';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Database } from 'better-sqlite3';
import { openDatabase } from './db';
import { EnvSecretBox } from './secret-box';
import { AIService, FileService } from '../core';
import { createUser } from './auth';
import { RPC_METHODS, makeContext } from './rpc';

// Builds an RpcContext over a fresh in-memory SQLite DB owned by one user.
function setup() {
  const db: Database = openDatabase(':memory:');
  const secretBox = new EnvSecretBox('test-secret-for-rpc-guard');
  const user = createUser(db, 'alice', 'password123');
  const ai = new AIService();
  const files = new FileService({ dataDir: mkdtempSync(join(tmpdir(), 'cq-rpc-')) });
  const ctx = makeContext(db, user.id, secretBox, ai, files);
  return { ctx };
}

// These prove the SSRF guard (assertPublicUrl) is wired into every AI RPC path
// that accepts a caller-controlled endpoint. Each must reject BEFORE any
// outbound request is attempted — so no network is made and no provider key is
// required. Cloud providers (anthropic/gemini/openai default) use hardcoded URLs
// and never reach this path, so they are not exercised here.
describe('RPC AI methods — SSRF guard on caller-controlled endpoints', () => {
  it('getOllamaModels rejects a loopback endpoint', async () => {
    const { ctx } = setup();
    await expect(
      RPC_METHODS.getOllamaModels(ctx, ['http://127.0.0.1:11434', undefined]),
    ).rejects.toThrow(/private or loopback/);
  });

  it('testConnection rejects the cloud metadata address', async () => {
    const { ctx } = setup();
    await expect(
      RPC_METHODS.testConnection(ctx, ['ollama', undefined, 'http://169.254.169.254/latest/meta-data/']),
    ).rejects.toThrow(/private or loopback/);
  });

  it('generateCase rejects a private endpoint resolved from stored prefs', async () => {
    const { ctx } = setup();
    await ctx.store.setPreference('ollama_endpoint', 'http://10.0.0.5:11434');
    await expect(
      RPC_METHODS.generateCase(ctx, [{}, 'ollama', 'llama2']),
    ).rejects.toThrow(/private or loopback/);
  });

  it('generateCase rejects an RFC1918 endpoint resolved from openai-compatible prefs', async () => {
    const { ctx } = setup();
    await ctx.store.setPreference('openai_base_url', 'http://192.168.1.10/v1');
    await expect(
      RPC_METHODS.generateCase(ctx, [{}, 'openai-compatible', 'gpt-4o']),
    ).rejects.toThrow(/private or loopback/);
  });
});
