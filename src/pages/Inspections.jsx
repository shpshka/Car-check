import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInspections } from '../api/inspectionsApi.js';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAppSettings } from '../i18n.jsx';
import { formatDate } from '../utils/format.js';

export default function Inspections() {
  const { t } = useAppSettings();
  const [inspections, setInspections] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getInspections()
      .then((data) => {
        setInspections(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => setError(err.message));
  }, []);

  const filteredInspections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return inspections;
    return inspections.filter((inspection) => {
      const text = `${inspection.transportPlateNumber || ''} ${inspection.driverName || ''} ${inspection.result || ''} ${inspection.inspectionDate || ''}`;
      return text.toLowerCase().includes(normalized);
    });
  }, [inspections, query]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{t('inspectionHistory')}</p>
          <h1>{t('inspections')}</h1>
          <p className="muted">{t('inspectionsSubtitle')}</p>
        </div>
      </div>

      <div className="toolbar">
        <input className="search-input" type="search" placeholder={t('searchInspection')} value={query} onChange={(event) => setQuery(event.target.value)} />
        <span className="muted">{t('found')}: {filteredInspections.length}</span>
      </div>

      {error && <p className="empty-state">{t('backendUnavailable')}: {error}</p>}

      {!error && filteredInspections.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('inspectionDate')}</th>
                <th>{t('plate')}</th>
                <th>{t('driver')}</th>
                <th>{t('result')}</th>
                <th>{t('nextInspection')}</th>
                <th>{t('comment')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((inspection) => (
                <tr key={inspection.id}>
                  <td>{formatDate(inspection.inspectionDate)}</td>
                  <td className="strong">{inspection.transportPlateNumber}</td>
                  <td>{inspection.driverName || t('noDriver')}</td>
                  <td><StatusBadge status={inspection.result} /></td>
                  <td>{formatDate(inspection.nextInspectionDate)}</td>
                  <td>{inspection.comment || t('noComment')}</td>
                  <td><Link className="button small secondary" to={`/transports/${inspection.transportId}`}>{t('open')}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !error && (
        <EmptyState title={t('noInspections')} text={t('noDueRemindersText')} />
      )}
    </section>
  );
}
