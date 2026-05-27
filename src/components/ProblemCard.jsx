import StatusBadge from './StatusBadge.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function ProblemCard({ problem, showTransport = false, compact = false, onResolve }) {
  const { t } = useAppSettings();
  return (
    <article className={`item-card ${compact ? 'compact-card' : ''}`}>
      <div className="card-heading">
        <div>
          <h3>{problem.title}</h3>
          {showTransport && <p>{problem.transportPlateNumber}</p>}
        </div>
        <StatusBadge status={problem.status} />
      </div>
      <p>{problem.description || t('noComment')}</p>
      {onResolve && problem.status !== 'RESOLVED' && (
        <div className="card-actions compact-actions">
          <button className="button small primary" type="button" onClick={onResolve}>{t('resolve')}</button>
        </div>
      )}
    </article>
  );
}
