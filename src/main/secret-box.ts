import { safeStorage } from 'electron';
import type { SecretBox } from '../core/secret-box';

// Electron SecretBox backed by the OS keychain via safeStorage.
export class ElectronSecretBox implements SecretBox {
  available(): boolean {
    return safeStorage.isEncryptionAvailable();
  }

  encrypt(plaintext: string): string {
    return safeStorage.encryptString(plaintext).toString('base64');
  }

  decrypt(b64: string): string {
    return safeStorage.decryptString(Buffer.from(b64, 'base64'));
  }
}
