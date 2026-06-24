import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import type { SecretBox } from '../core/secret-box';

// Server SecretBox backed by AES-256-GCM with a key derived from the
// CRITIQUEQUEST_SECRET environment variable. If the secret is unset, encryption
// is reported unavailable and the store keeps API keys as plaintext (callers are
// warned at startup).
export class EnvSecretBox implements SecretBox {
  private key: Buffer | null;

  constructor(secret = process.env.CRITIQUEQUEST_SECRET) {
    this.key = secret ? scryptSync(secret, 'critiquequest-secretbox-v1', 32) : null;
  }

  available(): boolean {
    return this.key !== null;
  }

  encrypt(plaintext: string): string {
    if (!this.key) throw new Error('Encryption unavailable: CRITIQUEQUEST_SECRET not set');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, ciphertext]).toString('base64');
  }

  decrypt(b64: string): string {
    if (!this.key) throw new Error('Encryption unavailable: CRITIQUEQUEST_SECRET not set');
    const raw = Buffer.from(b64, 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const ciphertext = raw.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }
}
