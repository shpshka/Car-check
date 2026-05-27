export default function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {text && <p>{text}</p>}
    </div>
  );
}
