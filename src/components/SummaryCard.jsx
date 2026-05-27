export default function SummaryCard({ label, value, tone = 'neutral' }) {
  return (
    <article className={`summary-card tone-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
