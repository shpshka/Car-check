import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';
import { useAppSettings } from '../i18n.jsx';

export default function TransportTable({ transports, onEdit, onDelete }) {
  const { t } = useAppSettings();
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t('plate')}</th>
            <th>{t('brand')}</th>
            <th>{t('model')}</th>
            <th>{t('year')}</th>
            <th>{t('lastDriver')}</th>
            <th>{t('lastInspection')}</th>
            <th>{t('nextInspection')}</th>
            <th>{t('problems')}</th>
            <th>{t('status')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {transports.map((transport) => (
            <tr key={transport.id}>
              <td className="strong">{transport.plateNumber}</td>
              <td>{transport.brand}</td>
              <td>{transport.model}</td>
              <td>{transport.year || '-'}</td>
              <td>{transport.lastDriverName || t('noDriver')}</td>
              <td>{formatDate(transport.lastInspectionDate)}</td>
              <td>{formatDate(transport.nextInspectionDate)}</td>
              <td>{transport.activeProblemsCount ?? 0}</td>
              <td><StatusBadge status={transport.status} /></td>
              <td>
                <div className="row-actions">
                  <Link className="button small secondary" to={`/transports/${transport.id}`}>{t('open')}</Link>
                  <button className="button small ghost" type="button" onClick={() => onEdit(transport)}>{t('edit')}</button>
                  <button className="button small danger" type="button" onClick={() => onDelete(transport)}>{t('delete')}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
