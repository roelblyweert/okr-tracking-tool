import { useState } from 'react';
import type { ObjectiveInput, ObjectiveWithKeyResults } from '../types';

interface Props {
  initial?: ObjectiveWithKeyResults;
  onSubmit: (input: ObjectiveInput) => Promise<void>;
  onCancel: () => void;
}

// Used for both "add" (no initial) and "edit" (initial provided).
export default function ObjectiveForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [owner, setOwner] = useState(initial?.owner ?? '');
  const [quarter, setQuarter] = useState(initial?.quarter ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        owner: owner.trim(),
        quarter: quarter.trim(),
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
          <label htmlFor="obj-quarter">Quarter</label>
          <input
            id="obj-quarter"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            placeholder="2026 Q2"
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
