import { useState } from 'react';
import FormField from './FormField.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function InspectionForm({ transports, drivers, defaultTransportId = '', onSubmit, onCancel, onCreateDriver }) {
  const { t } = useAppSettings();
  const [driverDraft, setDriverDraft] = useState({ fullName: '', phone: '' });
  const [form, setForm] = useState({
    transportId: defaultTransportId,
    driverId: drivers[0]?.id || '',
    inspectionDate: new Date().toISOString().slice(0, 10),
    result: 'PASSED',
    comment: '',
    nextInspectionPeriodDays: 30,
  });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      transportId: normalizeId(form.transportId),
      driverId: normalizeId(form.driverId),
      nextInspectionPeriodDays: Number(form.nextInspectionPeriodDays),
    });
  }

  async function handleQuickDriver(event) {
    event.preventDefault();
    if (!driverDraft.fullName.trim() || !onCreateDriver) return;
    const driver = await onCreateDriver({ ...driverDraft, comment: '' });
    setForm((current) => ({ ...current, driverId: driver.id }));
    setDriverDraft({ fullName: '', phone: '' });
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label={t('transport')}>
        <select name="transportId" value={form.transportId} onChange={updateField} required disabled={Boolean(defaultTransportId)}>
          <option value="">{t('selectTransport')}</option>
          {transports.map((transport) => (
            <option key={transport.id} value={transport.id}>{transport.plateNumber} - {transport.brand} {transport.model}</option>
          ))}
        </select>
      </FormField>
      <FormField label={t('driver')}>
        <select name="driverId" value={form.driverId} onChange={updateField} required>
          <option value="">{t('selectDriver')}</option>
          {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.fullName}</option>)}
        </select>
      </FormField>
      {onCreateDriver && (
        <div className="inline-create">
          <strong>{t('quickDriver')}</strong>
          <div className="form-row">
            <input value={driverDraft.fullName} onChange={(event) => setDriverDraft((current) => ({ ...current, fullName: event.target.value }))} placeholder={t('fullName')} />
            <input value={driverDraft.phone} onChange={(event) => setDriverDraft((current) => ({ ...current, phone: event.target.value }))} placeholder={t('phone')} />
          </div>
          <button className="button secondary" type="button" onClick={handleQuickDriver}>{t('addDriver')}</button>
        </div>
      )}
      <div className="form-row">
        <FormField label={t('inspectionDate')}>
          <input name="inspectionDate" type="date" value={form.inspectionDate} onChange={updateField} required />
        </FormField>
        <FormField label={t('nextInspectionDays')}>
          <input name="nextInspectionPeriodDays" type="number" min="1" value={form.nextInspectionPeriodDays} onChange={updateField} required />
        </FormField>
      </div>
      <FormField label={t('result')}>
        <select name="result" value={form.result} onChange={updateField} required>
          <option value="PASSED">PASSED</option>
          <option value="FAILED">FAILED</option>
          <option value="NEEDS_REPAIR">NEEDS_REPAIR</option>
        </select>
      </FormField>
      <FormField label={t('comment')}>
        <textarea name="comment" rows="3" value={form.comment} onChange={updateField} />
      </FormField>
      <div className="form-actions">
        <button className="button secondary" type="button" onClick={onCancel}>{t('cancel')}</button>
        <button className="button primary" type="submit">{t('addInspection')}</button>
      </div>
    </form>
  );
}

function normalizeId(value) {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}
