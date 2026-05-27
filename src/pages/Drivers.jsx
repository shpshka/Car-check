import { useEffect, useMemo, useState } from 'react';
import { createDriver, deleteDriver, getDrivers, updateDriver } from '../api/driversApi.js';
import DriverForm from '../components/DriverForm.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Toast from '../components/Toast.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function Drivers() {
  const { t } = useAppSettings();
  const [drivers, setDrivers] = useState([]);
  const [query, setQuery] = useState('');
  const [editingDriver, setEditingDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadDrivers(); }, []);

  async function loadDrivers() {
    try {
      setDrivers(await getDrivers());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  const filteredDrivers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return drivers;
    return drivers.filter((driver) => `${driver.fullName} ${driver.phone || ''}`.toLowerCase().includes(normalizedQuery));
  }, [drivers, query]);

  async function handleSubmitDriver(payload) {
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, payload);
        showToast(t('saveChanges'));
      } else {
        await createDriver(payload);
        showToast(t('addDriver'));
      }
      setIsModalOpen(false);
      await loadDrivers();
    } catch (err) {
      showToast(err.message || t('saveDriver'));
    }
  }

  async function handleDeleteDriver(driver) {
    if (!window.confirm(`${t('delete')} ${driver.fullName}?`)) return;
    await deleteDriver(driver.id);
    await loadDrivers();
    showToast(t('delete'));
  }

  return (
    <section className="page">
      <Toast message={toast} />
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('team')}</p>
          <h1>{t('drivers')}</h1>
          <p className="muted">{t('driversSubtitle')}</p>
        </div>
        <button className="button primary" type="button" onClick={() => { setEditingDriver(null); setIsModalOpen(true); }}>{t('addDriver')}</button>
      </div>

      <div className="toolbar">
        <input className="search-input" type="search" placeholder={t('searchDriver')} value={query} onChange={(event) => setQuery(event.target.value)} />
        <span className="muted">{t('found')}: {filteredDrivers.length}</span>
      </div>

      {error && <p className="empty-state">{t('backendUnavailable')}: {error}</p>}
      {!error && filteredDrivers.length ? (
        <div className="driver-grid">
          {filteredDrivers.map((driver) => (
            <article className="driver-card" key={driver.id}>
              <div>
                <h2>{driver.fullName}</h2>
                <p>{driver.phone || t('noData')}</p>
                <span>{driver.comment || t('noComment')}</span>
              </div>
              <div className="card-actions">
                <button className="button ghost full" type="button" onClick={() => { setEditingDriver(driver); setIsModalOpen(true); }}>{t('edit')}</button>
                <button className="button danger full" type="button" onClick={() => handleDeleteDriver(driver)}>{t('delete')}</button>
              </div>
            </article>
          ))}
        </div>
      ) : !error && (
        <EmptyState title={t('noDrivers')} text={t('noDriversText')} />
      )}

      {isModalOpen && (
        <Modal title={editingDriver ? t('editDriver') : t('addDriver')} onClose={() => setIsModalOpen(false)}>
          <DriverForm initialValues={editingDriver} submitLabel={editingDriver ? t('saveChanges') : t('addDriver')} onSubmit={handleSubmitDriver} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </section>
  );
}
