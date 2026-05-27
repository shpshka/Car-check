export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getDashboard: () => request('/api/dashboard'),
  getTransports: () => request('/api/transports'),
  getTransport: (id) => request(`/api/transports/${id}`),
  createTransport: (payload) => request('/api/transports', { method: 'POST', body: JSON.stringify(payload) }),
  updateTransport: (id, payload) => request(`/api/transports/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTransport: (id) => request(`/api/transports/${id}`, { method: 'DELETE' }),
  getDrivers: () => request('/api/drivers'),
  createDriver: (payload) => request('/api/drivers', { method: 'POST', body: JSON.stringify(payload) }),
  updateDriver: (id, payload) => request(`/api/drivers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDriver: (id) => request(`/api/drivers/${id}`, { method: 'DELETE' }),
  createInspection: (payload) => request('/api/inspections', { method: 'POST', body: JSON.stringify(payload) }),
  getInspections: (transportId) => request(`/api/transports/${transportId}/inspections`),
  getActiveProblems: () => request('/api/problems/active'),
  createProblem: (payload) => request('/api/problems', { method: 'POST', body: JSON.stringify(payload) }),
  resolveProblem: (id) => request(`/api/problems/${id}/resolve`, { method: 'PUT' }),
  getReminders: () => request('/api/reminders'),
};
