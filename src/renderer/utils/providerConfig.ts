import type { UserPreferences } from '../../shared/types';

export interface ProviderCall {
  provider: string;
  model: string;
  apiKey?: string;
  endpoint?: string;
}

const DEFAULT_OLLAMA_ENDPOINT = 'http://localhost:11434';

// Resolves the credentials/endpoint to send for a given provider from the
// stored preferences. Centralised so every caller (generation, context
// suggestion, practice analysis) stays consistent.
//
// The backend reuses two generic slots:
//   - `endpoint` = base URL    (Ollama address, or OpenAI-compatible base URL)
//   - `apiKey`   = credential  (provider key, or Ollama bearer token)
export function resolveProviderConfig(
  preferences: UserPreferences | null | undefined,
  provider: string,
  model: string,
): ProviderCall {
  switch (provider) {
    case 'ollama':
      return {
        provider,
        model,
        apiKey: preferences?.ollama_bearer || undefined,
        endpoint: preferences?.ollama_endpoint || DEFAULT_OLLAMA_ENDPOINT,
      };
    case 'openai-compatible':
      return {
        provider,
        model,
        apiKey: preferences?.api_keys?.['openai-compatible'] || undefined,
        endpoint: preferences?.openai_base_url || undefined,
      };
    default:
      return {
        provider,
        model,
        apiKey: preferences?.api_keys?.[provider] || undefined,
        endpoint: undefined,
      };
  }
}
