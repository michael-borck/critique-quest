import type { SecretBox } from './secret-box';

// API keys are encrypted at rest via the SecretBox so they never sit in
// plaintext in the data store. Values are stored as "enc:<base64>"; legacy
// plaintext values are tolerated on read and upgraded on the next save. If
// encryption is unavailable the keys fall back to plaintext.
const ENC_PREFIX = 'enc:';

export function encryptApiKeys(keys: Record<string, string>, box: SecretBox): Record<string, string> {
  const out: Record<string, string> = {};
  const available = box.available();
  for (const [name, value] of Object.entries(keys || {})) {
    if (!value) { out[name] = ''; continue; }
    if (value.startsWith(ENC_PREFIX) || !available) { out[name] = value; continue; }
    out[name] = ENC_PREFIX + box.encrypt(value);
  }
  return out;
}

export function decryptApiKeys(keys: Record<string, string>, box: SecretBox): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(keys || {})) {
    if (typeof value === 'string' && value.startsWith(ENC_PREFIX)) {
      try {
        out[name] = box.decrypt(value.slice(ENC_PREFIX.length));
      } catch {
        out[name] = '';
      }
    } else {
      out[name] = value; // legacy plaintext
    }
  }
  return out;
}
