import { getRequest } from './apiClient.js';

export function getDashboard() {
  return getRequest('/dashboard');
}
