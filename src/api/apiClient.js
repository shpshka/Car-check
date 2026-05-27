export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const REQUEST_TIMEOUT_MS = 4500;

async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
    ...options,
  }).catch((error) => {
    if (error.name === 'AbortError') {
      throw new Error('Backend did not respond. Start Spring Boot on http://localhost:8080');
    }
    throw new Error('Backend is unavailable. Start Spring Boot on http://localhost:8080');
  }).finally(() => window.clearTimeout(timeoutId));

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Some errors can come back without JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function getRequest(endpoint) {
  return request(endpoint);
}

export function postRequest(endpoint, data) {
  return request(endpoint, { method: 'POST', body: JSON.stringify(data) });
}

export function putRequest(endpoint, data) {
  return request(endpoint, { method: 'PUT', body: data === undefined ? undefined : JSON.stringify(data) });
}

export function deleteRequest(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}
