import { describe, it, expect } from 'vitest';
import { isPrivateAddress, assertPublicUrl } from './url-guard';

describe('isPrivateAddress', () => {
  it('flags loopback and private IPv4 ranges', () => {
    for (const ip of ['127.0.0.1', '10.0.0.5', '192.168.1.1', '172.16.0.1', '172.31.255.255', '169.254.169.254', '100.64.0.1', '0.0.0.0']) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
  });

  it('allows public IPv4 addresses', () => {
    for (const ip of ['8.8.8.8', '1.1.1.1', '93.184.216.34', '172.15.0.1', '172.32.0.1']) {
      expect(isPrivateAddress(ip)).toBe(false);
    }
  });

  it('flags loopback/link-local/unique-local IPv6 and IPv4-mapped', () => {
    for (const ip of ['::1', 'fe80::1', 'fc00::1', 'fd12::1', '::ffff:127.0.0.1', '::ffff:10.0.0.1']) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
    expect(isPrivateAddress('2606:4700:4700::1111')).toBe(false);
  });
});

describe('assertPublicUrl', () => {
  const resolvePublic = async () => ['93.184.216.34'];
  const resolvePrivate = async () => ['10.0.0.1'];

  it('rejects non-http(s) protocols', async () => {
    await expect(assertPublicUrl('file:///etc/passwd', resolvePublic)).rejects.toThrow(/HTTP and HTTPS/);
    await expect(assertPublicUrl('ftp://example.com', resolvePublic)).rejects.toThrow(/HTTP and HTTPS/);
  });

  it('rejects localhost and private literal IPs without resolving', async () => {
    await expect(assertPublicUrl('http://localhost/x', resolvePublic)).rejects.toThrow(/private or loopback/);
    await expect(assertPublicUrl('http://127.0.0.1/x', resolvePublic)).rejects.toThrow(/private or loopback/);
    await expect(assertPublicUrl('http://169.254.169.254/latest/meta-data/', resolvePublic)).rejects.toThrow(/private or loopback/);
  });

  it('rejects hostnames that resolve to private addresses', async () => {
    await expect(assertPublicUrl('https://rebind.example.com/x', resolvePrivate)).rejects.toThrow(/private or loopback/);
  });

  it('allows hostnames that resolve to public addresses', async () => {
    await expect(assertPublicUrl('https://example.com/data.json', resolvePublic)).resolves.toBeUndefined();
  });
});
