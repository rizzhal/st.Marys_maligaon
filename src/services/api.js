// Same-origin API client for the single Next.js application.
const BASE_URL = '/api';

async function request(path, options = {}) {
  try {
    const url = `${BASE_URL}${path}`;
    console.log('API Request:', url, options.method || 'GET');

    const headers = {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    const res = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    return contentType.includes('application/json') ? res.json() : res.text();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  put: (path, body) => request(path, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export default api;
