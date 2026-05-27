import { useEffect, useMemo, useState } from 'react';
import { getTransports } from '../api/transportsApi.js';
import { createReminder, getDueReminders, getReminders, markReminderSent } from '../api/remindersApi.js';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import ReminderCard from '../components/ReminderCard.jsx';
import ReminderForm from '../components/ReminderForm.jsx';
import Toast from '../components/Toast.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function Reminders() {
  const { t } = useAppSettings();
  const [reminders, setReminders] = useState([]);
  const [dueReminders, setDueReminders] = useState([]);
  const [transports, setTransports] = useState([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [all, due, transportData] = await Promise.all([getReminders(), getDueReminders(), getTransports()]);
      setReminders(Array.isArray(all) ? all : []);
      setDueReminders(Array.isArray(due) ? due : []);
      setTransports(Array.isArray(transportData) ? transportData : []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  async function handleMarkSent(reminder) {
    try {
      await markReminderSent(reminder.id);
      showToast(t('markSent'));
      await loadData();
    } catch (err) {
      showToast(err.message || t('markSent'));
    }
  }

  async function handleCreateReminder(payload) {
    try {
      await createReminder(payload);
      setIsModalOpen(false);
      showToast(t('addReminder'));
      await loadData();
    } catch (err) {
      showToast(err.message || t('addReminder'));
    }
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedQuery) return reminders;
    return reminders.filter((reminder) => {
      const text = `${reminder.message || reminder.title || ''} ${reminder.transportPlateNumber || ''} ${reminder.reminderDate || reminder.dueDate || ''}`;
      return text.toLowerCase().includes(normalizedQuery);
    });
  }, [normalizedQuery, reminders]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = filtered.filter((reminder) => !reminder.sent && (reminder.reminderDate || reminder.dueDate) > today);
  const sent = filtered.filter((reminder) => reminder.sent);
  const dueIds = new Set(dueReminders.map((reminder) => reminder.id));
  const due = filtered.filter((reminder) => dueIds.has(reminder.id) || (!reminder.sent && (reminder.reminderDate || reminder.dueDate) <= today));

  return (
    <section className="page">
      <Toast message={toast} />
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('inspectionSchedule')}</p>
          <h1>{t('reminders')}</h1>
          <p className="muted">{t('remindersSubtitle')}</p>
        </div>
        <button className="button primary" type="button" onClick={() => setIsModalOpen(true)}>{t('addReminder')}</button>
      </div>

      <div className="summary-grid">
        <div className="summary-card tone-danger"><p>{t('dueReminders')}</p><strong>{due.length}</strong></div>
        <div className="summary-card tone-info"><p>{t('upcomingReminders')}</p><strong>{upcoming.length}</strong></div>
        <div className="summary-card"><p>{t('allReminders')}</p><strong>{reminders.length}</strong></div>
        <div className="summary-card tone-warning"><p>{t('sent')}</p><strong>{sent.length}</strong></div>
      </div>

      <div className="toolbar">
        <input className="search-input" type="search" placeholder={t('searchReminder')} value={query} onChange={(event) => setQuery(event.target.value)} />
        <span className="muted">{t('found')}: {filtered.length}</span>
      </div>

      {error && <p className="empty-state">{t('backendUnavailable')}: {error}</p>}

      {!error && (
        <div className="reminder-board">
          <ReminderColumn title={t('dueReminders')} reminders={due} emptyTitle={t('noDueReminders')} emptyText={t('noDueRemindersText')} onMarkSent={handleMarkSent} />
          <ReminderColumn title={t('upcomingReminders')} reminders={upcoming} emptyTitle={t('noReminders')} emptyText={t('noRemindersText')} onMarkSent={handleMarkSent} />
          <ReminderColumn title={t('sent')} reminders={sent} emptyTitle={t('noReminders')} emptyText={t('noRemindersText')} />
        </div>
      )}

      {isModalOpen && (
        <Modal title={t('addReminder')} onClose={() => setIsModalOpen(false)}>
          <ReminderForm transports={transports} onSubmit={handleCreateReminder} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </section>
  );
}

function ReminderColumn({ title, reminders, emptyTitle, emptyText, onMarkSent }) {
  return (
    <section className="panel reminder-column">
      <div className="section-heading">
        <h2>{title}</h2>
        <span className="column-count">{reminders.length}</span>
      </div>
      <div className="stack-list">
        {reminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} onMarkSent={onMarkSent} />)}
        {!reminders.length && <EmptyState title={emptyTitle} text={emptyText} />}
      </div>
    </section>
  );
}
