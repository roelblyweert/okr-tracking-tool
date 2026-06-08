import type { OkrStatus } from '../progress';

interface Props {
  value: number; // 0–100
  label?: string;
  status?: OkrStatus;
}

export default function ProgressBar({ value, label, status }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" aria-label={label ?? `Progress ${pct}%`}>
      <div className="progress-track">
        <div
          className={`progress-fill${status ? ' is-' + status : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="progress-pct">{pct}%</span>
    </div>
  );
}
