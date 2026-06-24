import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('password hashing', () => {
  it('verifies a correct password and rejects a wrong one', () => {
    const stored = hashPassword('correct horse battery staple');
    expect(verifyPassword('correct horse battery staple', stored)).toBe(true);
    expect(verifyPassword('wrong password', stored)).toBe(false);
  });

  it('produces a unique salt per hash', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'));
  });

  it('rejects malformed stored hashes', () => {
    expect(verifyPassword('x', 'not-a-valid-hash')).toBe(false);
  });
});
