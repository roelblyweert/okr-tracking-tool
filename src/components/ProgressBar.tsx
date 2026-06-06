interface Props {
  value: number; // 0–100
  label?: string;
}

export default function ProgressBar({ value, label }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" aria-label={label ?? `Progress ${pct}%`}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-pct">{pct}%</span>
    </div>
  );
}
