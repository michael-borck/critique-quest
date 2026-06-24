// Auth client for the self-hosted web build. Sessions are httpOnly cookies, so
// there is no token to manage here — these just call the server's auth routes.

export interface AuthUser {
  username: string;
}

async function postAuth(path: string, body?: unknown): Promise<Response> {
  return fetch(`/api/auth/${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function currentUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (!res.ok) return null;
  return res.json();
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await postAuth('login', { username, password });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function register(username: string, password: string): Promise<AuthUser> {
  const res = await postAuth('register', { username, password });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function logout(): Promise<void> {
  await postAuth('logout');
}
