import { useState } from 'react';
import type { ObjectiveInput, ObjectiveWithKeyResults } from '../types';
import {
  compareMonths,
  dateToMonthInput,
  monthInputToDate,
} from '../lib/dates';

interface Props {
  initial?: ObjectiveWithKeyResults;
  onSubmit: (input: ObjectiveInput) => Promise<void>;
  onCancel: () => void;
}

// Current month as a 'YYYY-MM' value for <input type="month"> defaults.
function currentMonthInput(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Used for both "add" (no initial) and "edit" (initial provided).
export default function ObjectiveForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [owner, setOwner] = useState(initial?.owner ?? '');
  const [startMonth, setStartMonth] = useState(
    initial ? dateToMonthInput(initial.starts_on) : currentMonthInput(),
  );
  const [endMonth, setEndMonth] = useState(
    initial ? dateToMonthInput(initial.ends_on) : currentMonthInput(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (compareMonths(endMonth, startMonth) < 0) {
      setError('End month must be on or after the start month.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        owner: owner.trim(),
        starts_on: monthInputToDate(startMonth),
        ends_on: monthInputToDate(endMonth),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit objective' : 'New objective'}</h3>
      <label htmlFor="obj-title">Objective</label>
      <input
        id="obj-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Improve onboarding experience"
        required
      />
      <label htmlFor="obj-desc">Description</label>
      <textarea
        id="obj-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Why this matters (optional)"
        rows={2}
      />
      <div className="form-row">
        <div>
          <label htmlFor="obj-owner">Owner</label>
          <input
            id="obj-owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div>
          <label htmlFor="obj-start">Start month</label>
          <input
            id="obj-start"
            type="month"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="obj-end">End month</label>
          <input
            id="obj-end"
            type="month"
            value={endMonth}
            min={startMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            required
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
