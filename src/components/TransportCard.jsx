import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function TransportCard({ transport, onEdit, onDelete }) {
  const { t } = useAppSettings();
  return (
    <article className="transport-card">
      <div className="card-heading">
        <div>
          <h3>{transport.plateNumber}</h3>
          <p>{transport.brand} {transport.model} - {transport.year || '-'}</p>
        </div>
        <StatusBadge status={transport.status} />
      </div>
      <dl className="detail-grid compact">
        <div><dt>{t('lastDriver')}</dt><dd>{transport.lastDriverName || t('noDriver')}</dd></div>
        <div><dt>{t('lastInspection')}</dt><dd>{formatDate(transport.lastInspectionDate)}</dd></div>
        <div><dt>{t('nextInspection')}</dt><dd>{formatDate(transport.nextInspectionDate)}</dd></div>
        <div><dt>{t('activeProblemsCount')}</dt><dd>{transport.activeProblemsCount ?? 0}</dd></div>
      </dl>
      <div className="card-actions">
        <Link className="button secondary full" to={`/transports/${transport.id}`}>{t('open')}</Link>
        <button className="button ghost full" type="button" onClick={() => onEdit(transport)}>{t('edit')}</button>
        <button className="button danger full" type="button" onClick={() => onDelete(transport)}>{t('delete')}</button>
      </div>
    </article>
  );
}
