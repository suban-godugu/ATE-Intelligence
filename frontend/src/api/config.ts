/** Resolve API origin for fetch/EventSource (absolute URL). */
export function getApiOrigin(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env) {
    if (env.startsWith('http')) {
      try {
        return new URL(env).origin;
      } catch {
        return 'http://localhost:4000';
      }
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
  }
  return 'http://localhost:4000';
}

/** Path prefix for REST (axios baseURL). */
export function getApiBasePath(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (!env) return '/api';
  if (env.startsWith('http')) {
    try {
      const u = new URL(env);
      return u.pathname.replace(/\/$/, '') || '/api';
    } catch {
      return '/api';
    }
  }
  return env.replace(/\/$/, '') || '/api';
}

export function apiUrl(path: string): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  const p = path.startsWith('/') ? path : `/${path}`;

  if (env && env.startsWith('http')) {
    const envClean = env.replace(/\/$/, '');
    return `${envClean}${p}`;
  }

  const base = getApiBasePath();
  const joined = `${base}${p}`.replace(/\/+/g, '/');
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${joined.startsWith('/') ? '' : '/'}${joined}`;
  }
  return `${getApiOrigin()}${joined}`;
}

export function uploadProgressUrl(uploadId: string): string {
  return apiUrl(`/upload/progress/${uploadId}`);
}
