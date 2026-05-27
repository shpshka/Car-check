import { deleteRequest, getRequest, postRequest, putRequest } from './apiClient.js';

export function getTransports() {
  return getRequest('/transports');
}

export function getTransportById(id) {
  return getRequest(`/transports/${id}`);
}

export function createTransport(payload) {
  return postRequest('/transports', { ...payload, plateNumber: normalizePlate(payload.plateNumber) });
}

export function updateTransport(id, payload) {
  return putRequest(`/transports/${id}`, { ...payload, plateNumber: normalizePlate(payload.plateNumber) });
}

export function deleteTransport(id) {
  return deleteRequest(`/transports/${id}`);
}

function normalizePlate(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}
