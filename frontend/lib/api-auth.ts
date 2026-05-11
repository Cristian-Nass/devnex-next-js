const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:5000/api';
export type AuthUser = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  roles: Array<{ role: { name: string } }>;
};

type AuthResponse = { access_token: string; user: AuthUser };

async function extractError(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({})) as { message?: string };
  if (Array.isArray(data.message)) return data.message.join(', ');
  return data.message ?? `Request failed (${res.status})`;
}

export async function apiRegister(
  email: string,
  password: string,
  locale: string,
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, locale }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<{ message: string }>;
}

export async function apiVerifyEmail(token: string) {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<{ message: string }>;
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<AuthResponse>;
}

export async function apiLogout(token: string) {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiForgotPassword(email: string, locale: string) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, locale }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<{ message: string }>;
}

export async function apiResetPassword(token: string, password: string) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return res.json() as Promise<{ message: string }>;
}

export async function apiGetMe(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json() as Promise<AuthUser>;
}

/**
 * Builds the URL that starts the Google OAuth flow.
 * Encodes `locale` (and optional `redirectTo`) into the OAuth `state` param so
 * the backend callback can redirect to the correct locale after authentication.
 */
export function googleOAuthUrl(locale: string, redirectTo = '/home'): string {
  const state = btoa(JSON.stringify({ locale, redirectTo }));
  return `${API_URL}/auth/google?state=${encodeURIComponent(state)}`;
}

/** Token key used in localStorage. */
export const TOKEN_KEY = 'access_token';

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
