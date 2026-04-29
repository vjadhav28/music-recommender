const USER_ID_KEY = 'music-recommender-user-id';
const USER_ID_PATTERN = /^[a-zA-Z0-9_-]{8,80}$/;

function createUserId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `anon-${crypto.randomUUID()}`;
  }
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getAnonymousUserId() {
  if (typeof window === 'undefined') {
    return 'anon-server-render';
  }

  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing && USER_ID_PATTERN.test(existing)) {
    return existing;
  }

  const userId = createUserId();
  window.localStorage.setItem(USER_ID_KEY, userId);
  return userId;
}

export async function apiFetch(path, options = {}) {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const headers = new Headers(options.headers || {});
  headers.set('x-user-id', getAnonymousUserId());

  return fetch(`${apiBase}${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
}

export async function readApiError(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  return payload?.message || fallbackMessage;
}
