import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/dashboardApi.js';
import { getActiveProblems } from '../api/problemsApi.js';
import { getTransports } from '../api/transportsApi.js';
import EmptyState from '../components/EmptyState.jsx';
import ProblemCard from '../components/ProblemCard.jsx';
import ReminderCard from '../components/ReminderCard.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function Dashboard() {
  const { t } = useAppSettings();
  const [dashboard, setDashboard] = useState(null);
  const [activeProblemItems, setActiveProblemItems] = useState([]);
  const [transports, setTransports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getActiveProblems().catch(() => []),
      getTransports().catch(() => []),
    ])
      .then(([dashboardData, problemData, transportData]) => {
        setDashboard(dashboardData);
        const dashboardProblems = dashboardData.urgentItems?.activeProblems || [];
        setActiveProblemItems(Array.isArray(problemData) && problemData.length ? problemData : dashboardProblems);
        setTransports(Array.isArray(transportData) ? transportData : []);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="empty-state">{t('backendUnavailable')}: {error}</p>;
  if (!dashboard) return <p className="muted">{t('dashboard')}...</p>;

  const totalTransports = dashboard.totalTransports ?? dashboard.summary?.totalTransports ?? 0;
  const overdueInspections = dashboard.overdueInspections ?? dashboard.summary?.overdueInspections ?? 0;
  const activeProblems = activeProblemItems.length || dashboard.activeProblems || dashboard.summary?.activeProblems || 0;
  const upcomingInspections = dashboard.upcomingInspections ?? dashboard.summary?.upcomingInspections ?? 0;
  const urgentReminders = dashboard.urgentReminders ?? dashboard.urgentItems?.upcomingReminders ?? [];
  const problemTransports = (dashboard.problemTransports?.length ? dashboard.problemTransports : buildProblemTransports(activeProblemItems, transports));

  return (
    <section className="page">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">{t('controlCenter')}</p>
          <h1>{t('appTitle')}</h1>
          <p className="hero-copy">{t('appSubtitle')}</p>
        </div>
        <div className="hero-actions">
          <Link className="button primary" to="/transports">{t('addTransport')}</Link>
          <Link className="button secondary" to="/drivers">{t('addDriver')}</Link>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard label={t('totalTransports')} value={totalTransports} />
        <SummaryCard label={t('overdueInspections')} value={overdueInspections} tone="danger" />
        <SummaryCard label={t('activeProblems')} value={activeProblems} tone="warning" />
        <SummaryCard label={t('upcomingInspections')} value={upcomingInspections} tone="info" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>{t('dueReminders')}</h2>
            <Link className="text-link" to="/reminders">{t('allReminders')}</Link>
          </div>
          <div className="stack-list">
            {urgentReminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)}
            {!urgentReminders.length && <EmptyState title={t('noDueReminders')} text={t('noDueRemindersText')} />}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <h2>{t('problemTransports')}</h2>
            <Link className="text-link" to="/transports">{t('openList')}</Link>
          </div>
          <div className="stack-list">
            {problemTransports.map((transport) => (
              <ProblemCard
                key={transport.id}
                problem={{
                  title: transport.plateNumber,
                  description: `${transport.brand} ${transport.model}: ${transport.activeProblemsCount ?? 0}`,
                  status: transport.status,
                }}
                compact
              />
            ))}
            {!problemTransports.length && <EmptyState title={t('noActiveProblems')} text={t('noActiveProblemsText')} />}
          </div>
        </section>
      </div>
    </section>
  );
}

function buildProblemTransports(problems, transports) {
  const byTransport = new Map();
  problems.forEach((problem) => {
    const transportId = problem.transportId;
    if (!byTransport.has(transportId)) {
      const transport = transports.find((item) => String(item.id) === String(transportId)) || {};
      byTransport.set(transportId, {
        id: transportId,
        plateNumber: problem.transportPlateNumber || transport.plateNumber || '',
        brand: transport.brand || '',
        model: transport.model || '',
        status: 'HAS_PROBLEMS',
        activeProblemsCount: 0,
      });
    }
    byTransport.get(transportId).activeProblemsCount += 1;
  });
  return [...byTransport.values()];
}
