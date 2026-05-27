import { getRequest, postRequest, putRequest } from './apiClient.js';

export function createProblem(payload) {
  const safePayload = {
    ...payload,
    description: String(payload.description || '').trim() || payload.title,
    status: payload.status || 'OPEN',
  };
  return postRequest('/problems', safePayload);
}

export function getActiveProblems() {
  return getRequest('/problems/active');
}

export function getProblems() {
  return getActiveProblems();
}

export function getTransportProblems(transportId) {
  return getRequest(`/transports/${transportId}/problems`)
    .catch(() => getRequest(`/problems/transports/${transportId}`))
    .catch(() => getActiveProblems().then((problems) => problems.filter((problem) => String(problem.transportId) === String(transportId))));
}

export function resolveProblem(id) {
  return putRequest(`/problems/${id}/resolve`);
}
