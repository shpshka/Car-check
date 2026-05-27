import { useState } from 'react';
import { useAppSettings } from '../i18n.jsx';
import FormField from './FormField.jsx';

export default function ReminderForm({ transports, defaultTransportId = '', onSubmit, onCancel }) {
  const { t } = useAppSettings();
  const [transportQuery, setTransportQuery] = useState('');
  const [form, setForm] = useState({
    transportId: defaultTransportId,
    reminderDate: new Date().toISOString().slice(0, 10),
    message: '',
  });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const transport = transports.find((item) => String(item.id) === String(form.transportId));
    const message = form.message.trim() || `${transport?.plateNumber || ''}: ${t('reminders')}`;
    onSubmit({ ...form, transportId: normalizeId(form.transportId), message, sent: false });
  }

  const filteredTransports = transports.filter((transport) => {
    const text = `${transport.plateNumber} ${transport.brand} ${transport.model}`.toLowerCase();
    return text.includes(transportQuery.trim().toLowerCase());
  });

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label={t('transport')}>
        {!defaultTransportId && (
          <input type="search" value={transportQuery} onChange={(event) => setTransportQuery(event.target.value)} placeholder={t('searchPlate')} />
        )}
        <select name="transportId" value={form.transportId} onChange={updateField} required disabled={Boolean(defaultTransportId)}>
          <option value="">{t('selectTransport')}</option>
          {filteredTransports.map((transport) => (
            <option key={transport.id} value={transport.id}>{transport.plateNumber} - {transport.brand} {transport.model}</option>
          ))}
        </select>
      </FormField>
      <FormField label={t('reminderDate')}>
        <input name="reminderDate" type="date" value={form.reminderDate} onChange={updateField} required />
      </FormField>
      <FormField label={t('message')}>
        <textarea name="message" rows="3" value={form.message} onChange={updateField} placeholder={t('messagePlaceholder')} />
      </FormField>
      <div className="form-actions">
        <button className="button secondary" type="button" onClick={onCancel}>{t('cancel')}</button>
        <button className="button primary" type="submit">{t('addReminder')}</button>
      </div>
    </form>
  );
}

function normalizeId(value) {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}
