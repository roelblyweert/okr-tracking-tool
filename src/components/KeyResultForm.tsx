import { useState } from 'react';
import type { KeyResult } from '../types';
import {
  compareMonths,
  dateToMonthInput,
  isWithin,
  monthInputToDate,
} from '../lib/dates';

export interface KeyResultFormValues {
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  starts_on: string;
  ends_on: string;
}

interface Props {
  initial?: KeyResult;
  // The parent objective's window. The key result must stay fully inside it;
  // we also use it to seed defaults and constrain the month pickers.
  objectiveStart: string;
  objectiveEnd: string;
  onSubmit: (values: KeyResultFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function KeyResultForm({
  initial,
  objectiveStart,
  objectiveEnd,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [target, setTarget] = useState(String(initial?.target_value ?? ''));
  const [current, setCurrent] = useState(String(initial?.current_value ?? '0'));
  const [unit, setUnit] = useState(initial?.unit ?? '');
  // New key results default to the full objective window; editing keeps its own.
  const [startMonth, setStartMonth] = useState(
    dateToMonthInput(initial?.starts_on ?? objectiveStart),
  );
  const [endMonth, setEndMonth] = useState(
    dateToMonthInput(initial?.ends_on ?? objectiveEnd),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const objStartMonth = dateToMonthInput(objectiveStart);
  const objEndMonth = dateToMonthInput(objectiveEnd);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const starts_on = monthInputToDate(startMonth);
    const ends_on = monthInputToDate(endMonth);
    if (compareMonths(endMonth, startMonth) < 0) {
      setError('End month must be on or after the start month.');
      return;
    }
    if (!isWithin(starts_on, ends_on, objectiveStart, objectiveEnd)) {
      setError("Key result dates must fall within the objective's timeframe.");
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        target_value: Number(target) || 0,
        current_value: Number(current) || 0,
        unit: unit.trim(),
        starts_on,
        ends_on,
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
      <div className="form-row">
        <div>
          <label htmlFor="kr-start">Start month</label>
          <input
            id="kr-start"
            type="month"
            value={startMonth}
            min={objStartMonth}
            max={objEndMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="kr-end">End month</label>
          <input
            id="kr-end"
            type="month"
            value={endMonth}
            min={startMonth || objStartMonth}
            max={objEndMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            required
          />
        </div>
      </div>
      <p className="muted kr-window-hint">
        Must stay within the objective: {objStartMonth} to {objEndMonth}.
      </p>
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
