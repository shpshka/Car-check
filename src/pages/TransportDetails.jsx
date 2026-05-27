import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createDriver, getDrivers } from '../api/driversApi.js';
import { createInspection, getTransportInspections } from '../api/inspectionsApi.js';
import { createProblem, getTransportProblems, resolveProblem } from '../api/problemsApi.js';
import { getTransports, getTransportById } from '../api/transportsApi.js';
import EmptyState from '../components/EmptyState.jsx';
import InspectionForm from '../components/InspectionForm.jsx';
import Modal from '../components/Modal.jsx';
import ProblemCard from '../components/ProblemCard.jsx';
import ProblemForm from '../components/ProblemForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Toast from '../components/Toast.jsx';
import { useAppSettings } from '../i18n.jsx';
import { formatDate } from '../utils/format.js';

export default function TransportDetails() {
  const { t } = useAppSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [transport, setTransport] = useState(null);
  const [transports, setTransports] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadDetails(); }, [id]);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  async function loadDetails() {
    try {
      const [transportData, transportsData, driverData, problemData, inspectionData] = await Promise.all([
        getTransportById(id),
        getTransports(),
        getDrivers(),
        getTransportProblems(id).catch(() => []),
        getTransportInspections(id).catch(() => []),
      ]);
      const safeProblems = Array.isArray(problemData) ? problemData : [];
      const safeInspections = Array.isArray(inspectionData) ? inspectionData : [];
      const safeDrivers = Array.isArray(driverData) ? driverData : [];
      setTransport(normalizeTransportDetails(transportData, safeProblems, safeInspections, safeDrivers));
      setTransports(Array.isArray(transportsData) ? transportsData : []);
      setDrivers(safeDrivers);
      setProblems(safeProblems.filter((problem) => problem.status !== 'RESOLVED'));
      setInspections(safeInspections);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateInspection(payload) {
    await createInspection(payload);
    setModal(null);
    showToast(t('addInspection'));
    await loadDetails();
  }

  async function handleCreateProblem(payload) {
    await createProblem(payload);
    setModal(null);
    showToast(t('addProblem'));
    await loadDetails();
  }

  async function handleCreateDriver(payload) {
    const driver = await createDriver(payload);
    setDrivers((current) => [...current, driver]);
    return driver;
  }

  async function handleResolveProblem(problem) {
    await resolveProblem(problem.id);
    showToast(t('resolve'));
    await loadDetails();
  }

  if (error) return <section className="page"><p className="empty-state">{t('backendUnavailable')}: {error}</p><button className="button secondary" onClick={() => navigate('/transports')}>{t('backToTransports')}</button></section>;
  if (!transport) return <p className="muted">{t('transports')}...</p>;

  return (
    <section className="page">
      <Toast message={toast} />
      <div className="page-header">
        <div>
          <Link className="text-link" to="/transports">{t('backToTransports')}</Link>
          <h1>{transport.plateNumber}</h1>
          <p className="muted">{transport.brand} {transport.model} - {transport.year || '-'}</p>
        </div>
        <StatusBadge status={transport.status} />
      </div>

      <div className="detail-actions">
        <button className="button primary" type="button" onClick={() => setModal('inspection')}>{t('addInspection')}</button>
        <button className="button secondary" type="button" onClick={() => setModal('problem')}>{t('addProblem')}</button>
      </div>

      <div className="details-grid">
        <section className="panel">
          <h2>{t('vehicleInfo')}</h2>
          <dl className="detail-grid">
            <div><dt>{t('plate')}</dt><dd>{transport.plateNumber}</dd></div>
            <div><dt>{t('brand')}</dt><dd>{transport.brand}</dd></div>
            <div><dt>{t('model')}</dt><dd>{transport.model}</dd></div>
            <div><dt>{t('year')}</dt><dd>{transport.year || '-'}</dd></div>
            <div className="span-two"><dt>{t('comment')}</dt><dd>{transport.comment || t('noComment')}</dd></div>
          </dl>
        </section>

        <section className="panel">
          <h2>{t('inspectionState')}</h2>
          <dl className="detail-grid">
            <div><dt>{t('lastDriver')}</dt><dd>{transport.lastDriverName || t('noDriver')}</dd></div>
            <div><dt>{t('lastInspection')}</dt><dd>{formatDate(transport.lastInspectionDate)}</dd></div>
            <div><dt>{t('nextInspection')}</dt><dd>{formatDate(transport.nextInspectionDate)}</dd></div>
            <div><dt>{t('status')}</dt><dd><StatusBadge status={transport.status} /></dd></div>
          </dl>
        </section>

        <section className="panel">
          <h2>{t('activeProblems')}</h2>
          <div className="stack-list">
            {problems.length ? problems.map((problem) => <ProblemCard key={problem.id} problem={problem} onResolve={() => handleResolveProblem(problem)} />) : <EmptyState title={t('noActiveVehicleProblems')} text={t('noActiveProblemsText')} />}
          </div>
        </section>

        <section className="panel">
          <h2>{t('inspectionHistory')}</h2>
          <div className="stack-list">
            {inspections.length ? inspections.map((inspection) => (
              <article className="history-item" key={inspection.id}>
                <strong>{formatDate(inspection.inspectionDate)}</strong>
                <p>{inspection.result}</p>
                <span>{inspection.driverName} - {t('nextInspection')}: {formatDate(inspection.nextInspectionDate)}</span>
              </article>
            )) : <EmptyState title={t('noInspections')} text={t('noDueRemindersText')} />}
          </div>
        </section>
      </div>

      {modal === 'inspection' && (
        <Modal title={t('addInspection')} onClose={() => setModal(null)}>
          <InspectionForm transports={transports} drivers={drivers} defaultTransportId={id} onSubmit={handleCreateInspection} onCancel={() => setModal(null)} onCreateDriver={handleCreateDriver} />
        </Modal>
      )}
      {modal === 'problem' && (
        <Modal title={t('addProblem')} onClose={() => setModal(null)}>
          <ProblemForm transports={transports} defaultTransportId={id} onSubmit={handleCreateProblem} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </section>
  );
}

function normalizeTransportDetails(transport, problems, inspections, drivers) {
  const sortedInspections = [...inspections].sort((a, b) => String(b.inspectionDate || '').localeCompare(String(a.inspectionDate || '')));
  const latestInspection = sortedInspections[0];
  const latestDriver = latestInspection?.driverName || drivers.find((driver) => String(driver.id) === String(latestInspection?.driverId || transport.lastDriverId))?.fullName;

  return {
    ...transport,
    lastDriverName: transport.lastDriverName || latestDriver || null,
    lastInspectionDate: transport.lastInspectionDate || latestInspection?.inspectionDate || null,
    nextInspectionDate: transport.nextInspectionDate || latestInspection?.nextInspectionDate || null,
    activeProblems: transport.activeProblems || problems.filter((problem) => problem.status !== 'RESOLVED'),
    inspectionHistory: transport.inspectionHistory || sortedInspections,
  };
}
