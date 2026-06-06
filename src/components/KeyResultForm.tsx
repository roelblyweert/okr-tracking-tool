import { useState } from 'react';
import type { KeyResult } from '../types';

export interface KeyResultFormValues {
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
}

interface Props {
  initial?: KeyResult;
  onSubmit: (values: KeyResultFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function KeyResultForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [target, setTarget] = useState(String(initial?.target_value ?? ''));
  const [current, setCurrent] = useState(String(initial?.current_value ?? '0'));
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        target_value: Number(target) || 0,
        current_value: Number(current) || 0,
        unit: unit.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  }

  return (
    <form className="kr-form" onSubmit={handleSubmit}>
      <label htmlFor="kr-title">Key result</label>
      <input
        id="kr-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Reduce time-to-first-task"
        required
      />
      <div className="form-row">
        <div>
          <label htmlFor="kr-current">Current</label>
          <input
            id="kr-current"
            type="number"
            inputMode="decimal"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="kr-target">Target</label>
          <input
            id="kr-target"
            type="number"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="kr-unit">Unit</label>
          <input
            id="kr-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="%, days…"
          />
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
