import net from 'net';
import { promises as dns } from 'dns';

// True for loopback, link-local, and RFC1918 / unique-local ranges that a
// user-supplied import URL must never be allowed to reach (SSRF defence).
export function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const p = ip.split('.').map(Number);
    if (p[0] === 0 || p[0] === 10 || p[0] === 127) return true;
    if (p[0] === 169 && p[1] === 254) return true;                 // link-local incl. cloud metadata
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true;    // CGNAT
    return false;
  }
  const v = ip.toLowerCase();
  if (v === '::1' || v === '::') return true;
  if (v.startsWith('fe80')) return true;                           // link-local
  if (v.startsWith('fc') || v.startsWith('fd')) return true;       // unique local
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateAddress(mapped[1]);
  return false;
}

type Resolver = (host: string) => Promise<string[]>;

const defaultResolver: Resolver = async (host) =>
  (await dns.lookup(host, { all: true })).map(r => r.address);

// Validates an import URL before fetching: only http(s), and the host must not
// resolve to a private/loopback address. Note: this is a pre-flight check, so a
// determined attacker could still attempt DNS rebinding; it blocks the common
// SSRF cases (localhost, 169.254.169.254, internal ranges). The resolver is
// injectable for testing.
export async function assertPublicUrl(rawUrl: string, resolve: Resolver = defaultResolver): Promise<void> {
  const url = new URL(rawUrl);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost')) {
    throw new Error('Refusing to fetch from a private or loopback address');
  }
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) {
      throw new Error('Refusing to fetch from a private or loopback address');
    }
    return;
  }
  const addresses = await resolve(host);
  if (addresses.some(isPrivateAddress)) {
    throw new Error('Refusing to fetch from a private or loopback address');
  }
}
