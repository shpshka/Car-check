import { useEffect, useMemo, useState } from 'react';
import { createTransport, deleteTransport, getTransports, updateTransport } from '../api/transportsApi.js';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import Toast from '../components/Toast.jsx';
import TransportCard from '../components/TransportCard.jsx';
import TransportForm from '../components/TransportForm.jsx';
import TransportTable from '../components/TransportTable.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function Transports() {
  const { t } = useAppSettings();
  const [transports, setTransports] = useState([]);
  const [query, setQuery] = useState('');
  const [editingTransport, setEditingTransport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setTransports(await getTransports());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  }

  const filteredTransports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return transports.filter((transport) => `${transport.plateNumber} ${transport.brand} ${transport.model}`.toLowerCase().includes(normalizedQuery));
  }, [query, transports]);

  async function handleSubmitTransport(payload) {
    try {
      const plateNumber = normalizePlate(payload.plateNumber);
      const duplicate = transports.some((transport) => (
        normalizePlate(transport.plateNumber) === plateNumber && String(transport.id) !== String(editingTransport?.id || '')
      ));

      if (duplicate) {
        showToast(t('duplicatePlate'));
        return;
      }

      if (editingTransport) {
        await updateTransport(editingTransport.id, payload);
        showToast(t('saveChanges'));
      } else {
        await createTransport(payload);
        showToast(t('addTransport'));
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || t('saveTransport'));
    }
  }

  async function handleDeleteTransport(transport) {
    if (!window.confirm(`${t('delete')} ${transport.plateNumber}?`)) return;
    await deleteTransport(transport.id);
    await loadData();
    showToast(t('delete'));
  }

  return (
    <section className="page">
      <Toast message={toast} />
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('fleet')}</p>
          <h1>{t('transports')}</h1>
          <p className="muted">{t('transportsSubtitle')}</p>
        </div>
        <button className="button primary" type="button" onClick={() => { setEditingTransport(null); setIsModalOpen(true); }}>{t('addTransport')}</button>
      </div>

      <div className="toolbar">
        <input className="search-input" type="search" placeholder={t('searchPlate')} value={query} onChange={(event) => setQuery(event.target.value)} />
        <span className="muted">{t('found')}: {filteredTransports.length}</span>
      </div>

      {error && <p className="empty-state">{t('backendUnavailable')}: {error}</p>}
      {!error && filteredTransports.length ? (
        <>
          <div className="desktop-only"><TransportTable transports={filteredTransports} onEdit={(transport) => { setEditingTransport(transport); setIsModalOpen(true); }} onDelete={handleDeleteTransport} /></div>
          <div className="mobile-card-list">
            {filteredTransports.map((transport) => <TransportCard key={transport.id} transport={transport} onEdit={(item) => { setEditingTransport(item); setIsModalOpen(true); }} onDelete={handleDeleteTransport} />)}
          </div>
        </>
      ) : !error && (
        <EmptyState title={t('noTransports')} text={t('noTransportsText')} />
      )}

      {isModalOpen && (
        <Modal title={editingTransport ? t('editTransport') : t('addTransport')} onClose={() => setIsModalOpen(false)}>
          <TransportForm initialValues={editingTransport} submitLabel={editingTransport ? t('saveChanges') : t('addTransport')} onSubmit={handleSubmitTransport} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </section>
  );
}

function normalizePlate(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}
