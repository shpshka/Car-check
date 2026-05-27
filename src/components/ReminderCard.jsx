import { daysUntil, formatDate } from '../utils/format.js';
import { useAppSettings } from '../i18n.jsx';

export default function ReminderCard({ reminder, onMarkSent }) {
  const { t } = useAppSettings();
  const reminderDate = reminder.reminderDate ?? reminder.dueDate;
  const message = reminder.message ?? reminder.title ?? reminder.comment ?? '';
  const plate = reminder.transportPlateNumber ?? reminder.plateNumber ?? '';
  const left = daysUntil(reminderDate);
  const timeText = left < 0 ? t('daysOverdue', { days: Math.abs(left) }) : left === 0 ? t('today') : t('inDays', { days: left });

  return (
    <article className="item-card reminder-card">
      <div className="card-heading">
        <div>
          <h3>{plate || t('transport')}</h3>
          <p>{message}</p>
        </div>
      </div>
      <div className="meta-line">
        <span>{formatDate(reminderDate)}</span>
        <span>{timeText}</span>
      </div>
      <p className="muted">{t('sent')}: {reminder.sent ? 'true' : 'false'}</p>
      {onMarkSent && !reminder.sent && (
        <div className="card-actions compact-actions">
          <button className="button small primary" type="button" onClick={() => onMarkSent(reminder)}>{t('markSent')}</button>
        </div>
      )}
    </article>
  );
}
