export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const REQUEST_TIMEOUT_MS = 60000;
const RETRY_DELAY_MS = 2500;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function request(endpoint, options = {}, attempt = 0) {
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
    if (attempt < 1) {
      return sleep(RETRY_DELAY_MS).then(() => request(endpoint, options, attempt + 1));
    }
    if (error.name === 'AbortError') {
      throw new Error('Backend did not respond. Render may still be waking up. Try again in a minute.');
    }
    throw new Error('Backend is unavailable. Check the Render backend service.');
  }).finally(() => window.clearTimeout(timeoutId));

  if (response instanceof Response === false) {
    return response;
  }

  if (RETRYABLE_STATUSES.has(response.status) && attempt < 1) {
    await sleep(RETRY_DELAY_MS);
    return request(endpoint, options, attempt + 1);
  }

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
