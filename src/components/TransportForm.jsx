import { useState } from 'react';
import FormField from './FormField.jsx';
import { useAppSettings } from '../i18n.jsx';

const initialState = { plateNumber: '', brand: '', model: '', year: new Date().getFullYear(), comment: '' };

export default function TransportForm({ initialValues, submitLabel = 'Save transport', onSubmit, onCancel }) {
  const { t } = useAppSettings();
  const [form, setForm] = useState({ ...initialState, ...initialValues });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...form, year: form.year ? Number(form.year) : null });
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label={t('plate')}>
        <input name="plateNumber" value={form.plateNumber} onChange={updateField} placeholder="777ABC" required />
      </FormField>
      <div className="form-row">
        <FormField label={t('brand')}>
          <input name="brand" value={form.brand} onChange={updateField} required />
        </FormField>
        <FormField label={t('model')}>
          <input name="model" value={form.model} onChange={updateField} required />
        </FormField>
      </div>
      <FormField label={t('year')}>
        <input name="year" type="number" min="1980" max="2035" value={form.year || ''} onChange={updateField} />
      </FormField>
      <FormField label={t('comment')}>
        <textarea name="comment" rows="3" value={form.comment || ''} onChange={updateField} />
      </FormField>
      <div className="form-actions">
        <button className="button secondary" type="button" onClick={onCancel}>{t('cancel')}</button>
        <button className="button primary" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
