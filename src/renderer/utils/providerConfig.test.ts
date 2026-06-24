import { describe, it, expect } from 'vitest';
import { resolveProviderConfig } from './providerConfig';
import type { UserPreferences } from '../../shared/types';

const prefs = {
  api_keys: { openai: 'sk-oai', anthropic: 'sk-ant', google: 'goog', 'openai-compatible': 'sk-compat' },
  ollama_endpoint: 'http://nas.local:11434',
  ollama_bearer: 'ollama-token',
  openai_base_url: 'https://openrouter.ai/api/v1',
} as unknown as UserPreferences;

describe('resolveProviderConfig', () => {
  it('maps cloud providers to their stored key, no endpoint', () => {
    expect(resolveProviderConfig(prefs, 'openai', 'gpt-4')).toEqual({ provider: 'openai', model: 'gpt-4', apiKey: 'sk-oai', endpoint: undefined });
    expect(resolveProviderConfig(prefs, 'anthropic', 'claude').apiKey).toBe('sk-ant');
    expect(resolveProviderConfig(prefs, 'google', 'gemini').apiKey).toBe('goog');
  });

  it('routes ollama with its endpoint and optional bearer', () => {
    expect(resolveProviderConfig(prefs, 'ollama', 'llama3')).toEqual({
      provider: 'ollama', model: 'llama3', apiKey: 'ollama-token', endpoint: 'http://nas.local:11434',
    });
  });

  it('routes openai-compatible to its key + base URL', () => {
    expect(resolveProviderConfig(prefs, 'openai-compatible', 'mixtral')).toEqual({
      provider: 'openai-compatible', model: 'mixtral', apiKey: 'sk-compat', endpoint: 'https://openrouter.ai/api/v1',
    });
  });

  it('defaults ollama endpoint to localhost when unset and tolerates missing prefs', () => {
    expect(resolveProviderConfig(null, 'ollama', 'llama3').endpoint).toBe('http://localhost:11434');
    expect(resolveProviderConfig(null, 'openai', 'gpt-4').apiKey).toBeUndefined();
  });
});
