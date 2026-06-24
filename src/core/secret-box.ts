// Abstraction over at-rest encryption for secrets (API keys). The Electron app
// backs this with the OS keychain (safeStorage); the self-hosted server backs
// it with an AES key from the environment. `available() === false` means values
// are stored as-is (no encryption available) and callers fall back to plaintext.
export interface SecretBox {
  available(): boolean;
  encrypt(plaintext: string): string; // returns base64 ciphertext
  decrypt(b64: string): string;        // takes base64 ciphertext, returns plaintext
}
