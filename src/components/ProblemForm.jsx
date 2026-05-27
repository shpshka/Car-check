import { useState } from 'react';
import FormField from './FormField.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function ProblemForm({ transports, defaultTransportId = '', onSubmit, onCancel }) {
  const { t } = useAppSettings();
  const [transportQuery, setTransportQuery] = useState('');
  const [form, setForm] = useState({
    transportId: defaultTransportId,
    title: '',
    description: '',
    status: 'OPEN',
  });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...form, transportId: normalizeId(form.transportId), description: form.description.trim() || form.title.trim() });
  }

  const filteredTransports = transports.filter((transport) => {
    const text = `${transport.plateNumber} ${transport.brand} ${transport.model}`.toLowerCase();
    return text.includes(transportQuery.trim().toLowerCase());
  });

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label={t('transport')}>
        {!defaultTransportId && (
          <input
            value={transportQuery}
            onChange={(event) => setTransportQuery(event.target.value)}
            placeholder={t('searchPlate')}
            type="search"
          />
        )}
        <select name="transportId" value={form.transportId} onChange={updateField} required disabled={Boolean(defaultTransportId)}>
          <option value="">{t('selectTransport')}</option>
          {filteredTransports.map((transport) => (
            <option key={transport.id} value={transport.id}>{transport.plateNumber} - {transport.brand} {transport.model}</option>
          ))}
        </select>
      </FormField>
      <FormField label={t('title')}>
        <input name="title" value={form.title} onChange={updateField} placeholder="Engine noise" required />
      </FormField>
      <FormField label={t('description')}>
        <textarea name="description" rows="3" value={form.description} onChange={updateField} />
      </FormField>
      <FormField label={t('status')}>
        <select name="status" value={form.status} onChange={updateField}>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </FormField>
      <div className="form-actions">
        <button className="button secondary" type="button" onClick={onCancel}>{t('cancel')}</button>
        <button className="button primary" type="submit">{t('saveProblem')}</button>
      </div>
    </form>
  );
}

function normalizeId(value) {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}
