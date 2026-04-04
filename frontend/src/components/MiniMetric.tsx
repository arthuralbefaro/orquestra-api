import type { ReactNode } from 'react';

type MiniMetricProps = {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'success' | 'danger';
};

export default function MiniMetric({
  label,
  value,
  tone = 'default',
}: MiniMetricProps) {
  return (
    <div className="mini-metric">
      <span className="mini-label">{label}</span>
      <span
        className={`mini-value ${
          tone === 'success' ? 'mini-success' : tone === 'danger' ? 'mini-danger' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}