import { supabase } from './lib/supabaseClient';
import type {
  KeyResult,
  KeyResultInput,
  Objective,
  ObjectiveInput,
  ObjectiveWithKeyResults,
} from './types';

// ---------------------------------------------------------------------------
// All database access lives here (see CLAUDE.md). Components never query
// Supabase directly — they call these wrappers. Row-Level Security on the
// server is what actually authorises every one of these operations.
// ---------------------------------------------------------------------------

function throwIfError<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

// --- Objectives ------------------------------------------------------------

export async function listObjectives(): Promise<ObjectiveWithKeyResults[]> {
  const { data, error } = await supabase
    .from('objectives')
    .select('*, key_results(*)')
    .order('created_at', { ascending: true });

  const rows = throwIfError(data, error) as ObjectiveWithKeyResults[];
  // Keep key results in a stable order for the UI.
  for (const obj of rows) {
    obj.key_results.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  return rows;
}

export async function createObjective(input: ObjectiveInput): Promise<Objective> {
  const { data, error } = await supabase
    .from('objectives')
    .insert(input)
    .select()
    .single();
  return throwIfError(data, error);
}

export async function updateObjective(
  id: string,
  input: ObjectiveInput,
): Promise<Objective> {
  const { data, error } = await supabase
    .from('objectives')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  return throwIfError(data, error);
}

export async function deleteObjective(id: string): Promise<void> {
  // key_results rows are removed automatically via ON DELETE CASCADE.
  const { error } = await supabase.from('objectives').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- Key results -----------------------------------------------------------

export async function createKeyResult(input: KeyResultInput): Promise<KeyResult> {
  const { data, error } = await supabase
    .from('key_results')
    .insert(input)
    .select()
    .single();
  return throwIfError(data, error);
}

export async function updateKeyResult(
  id: string,
  input: Omit<KeyResultInput, 'objective_id'>,
): Promise<KeyResult> {
  const { data, error } = await supabase
    .from('key_results')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  return throwIfError(data, error);
}

export async function deleteKeyResult(id: string): Promise<void> {
  const { error } = await supabase.from('key_results').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
