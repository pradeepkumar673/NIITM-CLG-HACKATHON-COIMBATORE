/**
 * auth.ts – decode the stored JWT and return user info.
 * Never logs patient data or PII (R10).
 */

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'health_worker' | 'doctor' | 'admin';
  clinicName?: string;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUser | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  return {
    id: payload.sub as number,
    email: payload.email as string,
    name: (payload.name as string) || (payload.email as string) || 'User',
    role: (payload.role as AuthUser['role']) || 'health_worker',
    clinicName: payload.clinic_name as string,
  };
}

/**
 * Fetch a protected image endpoint with the Bearer token and return an
 * object-URL so <img src> can render it without exposing the token in the URL.
 */
export async function fetchProtectedImage(url: string): Promise<string | null> {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
