import { getRequest, postRequest } from './apiClient.js';
import { getTransports } from './transportsApi.js';

export function createInspection(payload) {
  return postRequest('/inspections', payload);
}

export function getTransportInspections(id) {
  return getRequest(`/transports/${id}/inspections`);
}

export function getInspections() {
  return getRequest('/inspections').catch(async () => {
    const transports = await getTransports();
    const groups = await Promise.all(
      transports.map((transport) => getTransportInspections(transport.id)
        .then((inspections) => inspections.map((inspection) => ({
          ...inspection,
          transportId: inspection.transportId || transport.id,
          transportPlateNumber: inspection.transportPlateNumber || transport.plateNumber,
        })))
        .catch(() => []))
    );
    return groups.flat().sort((a, b) => String(b.inspectionDate || '').localeCompare(String(a.inspectionDate || '')));
  });
}
