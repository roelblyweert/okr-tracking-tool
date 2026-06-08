import { useState } from 'react';
import type { ObjectiveInput, ObjectiveWithKeyResults } from '../types';
import { keyResultProgress, objectiveProgress } from '../progress';
import { formatMonthLabel } from '../lib/dates';
import ProgressBar from './ProgressBar';
import ObjectiveForm from './ObjectiveForm';
import KeyResultForm, { KeyResultFormValues } from './KeyResultForm';

interface Props {
  objective: ObjectiveWithKeyResults;
  onEditObjective: (id: string, input: ObjectiveInput) => Promise<void>;
  onDeleteObjective: (id: string) => Promise<void>;
  onAddKeyResult: (objectiveId: string, values: KeyResultFormValues) => Promise<void>;
  onEditKeyResult: (krId: string, values: KeyResultFormValues) => Promise<void>;
  onDeleteKeyResult: (krId: string) => Promise<void>;
}

export default function ObjectiveCard({
  objective,
  onEditObjective,
  onDeleteObjective,
  onAddKeyResult,
  onEditKeyResult,
  onDeleteKeyResult,
}: Props) {
  const [editingObjective, setEditingObjective] = useState(false);
  const [addingKr, setAddingKr] = useState(false);
  const [editingKrId, setEditingKrId] = useState<string | null>(null);

  if (editingObjective) {
    return (
      <ObjectiveForm
        initial={objective}
        onSubmit={async (input) => {
          await onEditObjective(objective.id, input);
          setEditingObjective(false);
        }}
        onCancel={() => setEditingObjective(false)}
      />
    );
  }

  return (
    <article className="card objective">
      <header className="objective-head">
        <div>
          <h2>{objective.title}</h2>
          <p className="meta">
            <span>
              {formatMonthLabel(objective.starts_on)} –{' '}
              {formatMonthLabel(objective.ends_on)}
            </span>
            {objective.owner && <span>· {objective.owner}</span>}
          </p>
        </div>
        <div className="row-actions">
          <button className="link" onClick={() => setEditingObjective(true)}>
            Edit
          </button>
          <button
            className="link danger"
            onClick={() => {
              if (confirm('Delete this objective and all its key results?')) {
                void onDeleteObjective(objective.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      </header>

      {objective.description && <p className="desc">{objective.description}</p>}

      <ProgressBar value={objectiveProgress(objective)} label="Objective progress" />

      <ul className="kr-list">
        {objective.key_results.map((kr) =>
          editingKrId === kr.id ? (
            <li key={kr.id}>
              <KeyResultForm
                initial={kr}
                objectiveStart={objective.starts_on}
                objectiveEnd={objective.ends_on}
                onSubmit={async (values) => {
                  await onEditKeyResult(kr.id, values);
                  setEditingKrId(null);
                }}
                onCancel={() => setEditingKrId(null)}
              />
            </li>
          ) : (
            <li key={kr.id} className="kr">
              <div className="kr-info">
                <span className="kr-title">{kr.title}</span>
                <span className="kr-values">
                  {kr.current_value} / {kr.target_value} {kr.unit}
                </span>
              </div>
              <p className="kr-dates muted">
                {formatMonthLabel(kr.starts_on)} –{' '}
                {formatMonthLabel(kr.ends_on)}
              </p>
              <ProgressBar value={keyResultProgress(kr)} label={kr.title} />
              <div className="row-actions">
                <button className="link" onClick={() => setEditingKrId(kr.id)}>
                  Edit
                </button>
                <button
                  className="link danger"
                  onClick={() => {
                    if (confirm('Delete this key result?')) {
                      void onDeleteKeyResult(kr.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      {addingKr ? (
        <KeyResultForm
          objectiveStart={objective.starts_on}
          objectiveEnd={objective.ends_on}
          onSubmit={async (values) => {
            await onAddKeyResult(objective.id, values);
            setAddingKr(false);
          }}
          onCancel={() => setAddingKr(false)}
        />
      ) : (
        <button className="secondary" onClick={() => setAddingKr(true)}>
          + Add key result
        </button>
      )}
    </article>
  );
}
