import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProblem, getActiveProblems, resolveProblem } from '../api/problemsApi.js';
import { getTransports } from '../api/transportsApi.js';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import ProblemCard from '../components/ProblemCard.jsx';
import ProblemForm from '../components/ProblemForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Toast from '../components/Toast.jsx';
import { useAppSettings } from '../i18n.jsx';
import { formatDateTime } from '../utils/format.js';

export default function Problems() {
  const { t } = useAppSettings();
  const [problems, setProblems] = useState([]);
  const [transports, setTransports] = useState([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [problemData, transportData] = await Promise.all([getActiveProblems(), getTransports()]);
      setProblems(Array.isArray(problemData) ? problemData : []);
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

  const filteredProblems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return problems;
    return problems.filter((problem) => `${problem.title} ${problem.description || ''} ${problem.transportPlateNumber || ''}`.toLowerCase().includes(normalized));
  }, [problems, query]);

  async function handleCreateProblem(payload) {
    try {
      await createProblem(payload);
      setIsModalOpen(false);
      showToast(t('addProblem'));
      await loadData();
    } catch (err) {
      showToast(err.message || t('saveProblem'));
    }
  }

  async function handleResolve(problem) {
    await resolveProblem(problem.id);
    showToast(t('resolve'));
    await loadData();
  }

  return (
    <section className="page">
      <Toast message={toast} />
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('activeProblems')}</p>
          <h1>{t('problems')}</h1>
          <p className="muted">{t('noActiveProblemsText')}</p>
        </div>
        <button className="button primary" type="button" onClick={() => setIsModalOpen(true)}>{t('addProblem')}</button>
      </div>

      <div className="toolbar">
        <input className="search-input" type="search" placeholder={t('searchProblem')} value={query} onChange={(event) => setQuery(event.target.value)} />
        <span className="muted">{t('found')}: {filteredProblems.length}</span>
      </div>

      {error && <p className="empty-state">{t('backendUnavailable')}: {error}</p>}

      {!error && filteredProblems.length ? (
        <div className="problem-grid">
          {filteredProblems.map((problem) => (
            <article className="item-card problem-work-card" key={problem.id}>
              <div className="card-heading">
                <div>
                  <h3>{problem.title}</h3>
                  <p>{problem.transportPlateNumber || t('transport')}</p>
                </div>
                <StatusBadge status={problem.status} />
              </div>
              <p>{problem.description || t('noComment')}</p>
              <div className="meta-line">
                <span>{formatDateTime(problem.createdAt)}</span>
                <Link className="text-link" to={`/transports/${problem.transportId}`}>{t('open')}</Link>
              </div>
              <div className="card-actions compact-actions">
                <button className="button small primary" type="button" onClick={() => handleResolve(problem)}>{t('resolve')}</button>
              </div>
            </article>
          ))}
        </div>
      ) : !error && (
        <EmptyState title={t('noActiveProblems')} text={t('noActiveProblemsText')} />
      )}

      {isModalOpen && (
        <Modal title={t('addProblem')} onClose={() => setIsModalOpen(false)}>
          <ProblemForm transports={transports} onSubmit={handleCreateProblem} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </section>
  );
}
