export default function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="card stat-card">
      <div className="stat-row">
        <p className="muted">{title}</p>
        <span className="stat-dot" />
      </div>

      <h3>{value}</h3>

      {subtitle ? <span className="muted">{subtitle}</span> : null}
    </div>
  );
}