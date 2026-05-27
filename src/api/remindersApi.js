import { getRequest, postRequest, putRequest } from './apiClient.js';

export function getReminders() {
  return getRequest('/reminders');
}

export function getDueReminders() {
  return getRequest('/reminders/due');
}

export function getTransportReminders(transportId) {
  return getRequest(`/transports/${transportId}/reminders`);
}

export function createReminder(payload) {
  return postRequest('/reminders', payload).catch(() => postRequest('/reminders', {
    transportId: payload.transportId,
    title: payload.message,
    dueDate: payload.reminderDate,
    type: 'OTHER',
    priority: 'MEDIUM',
    status: 'ACTIVE',
    comment: payload.message,
  }));
}

export function markReminderSent(id) {
  return putRequest(`/reminders/${id}/sent`).catch(() => putRequest(`/reminders/${id}/done`));
}
