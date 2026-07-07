/**
 * Thin fetch wrapper — interface axios-compatible (get/post/put/delete)
 * Lit le token depuis localStorage (clé 'token' ou 'authToken')
 * Timeout: 10s, retry: 2 fois sur erreur réseau (pas sur 4xx/5xx)
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

const getHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchWithTimeout = (url, options) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
};

const request = async (method, url, body, attempt = 0) => {
  try {
    const res = await fetchWithTimeout(`${BASE}${url}`, {
      method,
      headers: getHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(json.message || `HTTP ${res.status}`);
      err.response = { data: json, status: res.status };
      throw err;
    }
    return { data: json };
  } catch (err) {
    // Retry uniquement sur erreur réseau/timeout, pas sur erreurs HTTP
    const isNetworkError = !err.response && attempt < MAX_RETRIES;
    if (isNetworkError) {
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      return request(method, url, body, attempt + 1);
    }
    throw err;
  }
};

const api = {
  get:    (url)       => request('GET', url),
  post:   (url, data) => request('POST', url, data),
  put:    (url, data) => request('PUT', url, data),
  delete: (url)       => request('DELETE', url),
};

export default api;
