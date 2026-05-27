import { useState } from 'react';
import FormField from './FormField.jsx';
import { useAppSettings } from '../i18n.jsx';

const initialState = { fullName: '', phone: '', comment: '' };

export default function DriverForm({ initialValues, submitLabel = 'Save driver', onSubmit, onCancel }) {
  const { t } = useAppSettings();
  const [form, setForm] = useState({ ...initialState, ...initialValues });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label={t('fullName')}>
        <input name="fullName" value={form.fullName} onChange={updateField} placeholder="Erlan" required />
      </FormField>
      <FormField label={t('phone')}>
        <input name="phone" value={form.phone || ''} onChange={updateField} placeholder="+77771234567" />
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
