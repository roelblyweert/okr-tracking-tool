export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  created_at: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  owner: string;
  quarter: string;
  created_at: string;
}

// An objective with its key results joined in, as used by the UI.
export interface ObjectiveWithKeyResults extends Objective {
  key_results: KeyResult[];
}

// Field payloads for create/update (server fills id/created_at).
export type ObjectiveInput = Pick<
  Objective,
  'title' | 'description' | 'owner' | 'quarter'
>;

export type KeyResultInput = Pick<
  KeyResult,
  'objective_id' | 'title' | 'target_value' | 'current_value' | 'unit'
>;
