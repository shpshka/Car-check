import { useAppSettings } from '../i18n.jsx';

export default function StatusBadge({ status }) {
  const { t } = useAppSettings();
  return <span className={`status-badge status-${status}`}>{t(`status_${status}`) || status}</span>;
}
