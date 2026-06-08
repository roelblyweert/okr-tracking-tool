import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import type { ObjectiveInput, ObjectiveWithKeyResults } from './types';
import {
  createKeyResult,
  createObjective,
  deleteKeyResult,
  deleteObjective,
  listObjectives,
  updateKeyResult,
  updateObjective,
} from './api';
import Auth from './components/Auth';
import ObjectiveCard from './components/ObjectiveCard';
import ObjectiveForm from './components/ObjectiveForm';
import RoadmapView from './components/RoadmapView';
import type { KeyResultFormValues } from './components/KeyResultForm';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Track the auth session; Supabase persists it across reloads.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authReady) {
    return <div className="centered">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="centered">
        <Auth />
      </div>
    );
  }

  return <Dashboard email={session.user.email ?? ''} />;
}

function Dashboard({ email }: { email: string }) {
  const [objectives, setObjectives] = useState<ObjectiveWithKeyResults[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<'list' | 'roadmap'>('list');

  async function refresh() {
    setError('');
    try {
      setObjectives(await listObjectives());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load OKRs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  // Handlers refetch after each mutation — the dataset is small, so this keeps
  // local state perfectly in sync with the shared database without bookkeeping.
  async function handleAddObjective(input: ObjectiveInput) {
    await createObjective(input);
    setAdding(false);
    await refresh();
  }
  async function handleEditObjective(id: string, input: ObjectiveInput) {
    await updateObjective(id, input);
    await refresh();
  }
  async function handleDeleteObjective(id: string) {
    await deleteObjective(id);
    await refresh();
  }
  async function handleAddKeyResult(objectiveId: string, values: KeyResultFormValues) {
    await createKeyResult({ objective_id: objectiveId, ...values });
    await refresh();
  }
  async function handleEditKeyResult(krId: string, values: KeyResultFormValues) {
    await updateKeyResult(krId, values);
    await refresh();
  }
  async function handleDeleteKeyResult(krId: string) {
    await deleteKeyResult(krId);
    await refresh();
  }

  return (
    <div className={view === 'roadmap' ? 'app app--wide' : 'app'}>
      <header className="app-head">
        <h1>Team OKRs</h1>
        <div className="view-toggle" role="tablist">
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            className={view === 'roadmap' ? 'active' : ''}
            onClick={() => setView('roadmap')}
          >
            Roadmap
          </button>
        </div>
        <div className="app-head-right">
          <span className="who">{email}</span>
          <button className="link" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </div>
      </header>

      {error && <p className="error banner">{error}</p>}

      {loading ? (
        <p className="muted">Loading OKRs…</p>
      ) : view === 'roadmap' ? (
        <RoadmapView objectives={objectives} />
      ) : (
        <>
          {objectives.length === 0 && !adding && (
            <p className="muted">No objectives yet. Add your first one below.</p>
          )}

          <div className="objectives">
            {objectives.map((obj) => (
              <ObjectiveCard
                key={obj.id}
                objective={obj}
                onEditObjective={handleEditObjective}
                onDeleteObjective={handleDeleteObjective}
                onAddKeyResult={handleAddKeyResult}
                onEditKeyResult={handleEditKeyResult}
                onDeleteKeyResult={handleDeleteKeyResult}
              />
            ))}
          </div>

          {adding ? (
            <ObjectiveForm
              onSubmit={handleAddObjective}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <button className="primary add-objective" onClick={() => setAdding(true)}>
              + Add objective
            </button>
          )}
        </>
      )}
    </div>
  );
}
