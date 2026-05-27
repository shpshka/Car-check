import { deleteRequest, getRequest, postRequest, putRequest } from './apiClient.js';

export function getDrivers() {
  return getRequest('/drivers');
}

export function getDriver(id) {
  return getRequest(`/drivers/${id}`);
}

export function createDriver(payload) {
  return postRequest('/drivers', payload);
}

export function updateDriver(id, payload) {
  return putRequest(`/drivers/${id}`, payload);
}

export function deleteDriver(id) {
  return deleteRequest(`/drivers/${id}`);
}
