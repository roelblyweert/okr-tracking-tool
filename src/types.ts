export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  // Month-level timeline, stored as a DATE pinned to the first of the month
  // ('YYYY-MM-01'). ends_on is the INCLUSIVE last month. A key result's window
  // must fall fully inside its parent objective's window (enforced in the form
  // and by a database trigger — see supabase/schema.sql).
  starts_on: string;
  ends_on: string;
  created_at: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  owner: string;
  // Month-level timeline ('YYYY-MM-01', ends_on inclusive). Objectives may span
  // multiple quarters.
  starts_on: string;
  ends_on: string;
  created_at: string;
}

// An objective with its key results joined in, as used by the UI.
export interface ObjectiveWithKeyResults extends Objective {
  key_results: KeyResult[];
}

// Field payloads for create/update (server fills id/created_at).
export type ObjectiveInput = Pick<
  Objective,
  'title' | 'description' | 'owner' | 'starts_on' | 'ends_on'
>;

export type KeyResultInput = Pick<
  KeyResult,
  | 'objective_id'
  | 'title'
  | 'target_value'
  | 'current_value'
  | 'unit'
  | 'starts_on'
  | 'ends_on'
>;
