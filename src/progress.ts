import type { KeyResult, ObjectiveWithKeyResults } from './types';

// Progress of a single key result as a 0–100 percentage, clamped.
export function keyResultProgress(kr: KeyResult): number {
  if (!kr.target_value) return 0;
  const pct = (kr.current_value / kr.target_value) * 100;
  if (!Number.isFinite(pct)) return 0;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

// Objective progress = average of its key results' progress (0 if none).
export function objectiveProgress(obj: ObjectiveWithKeyResults): number {
  if (obj.key_results.length === 0) return 0;
  const total = obj.key_results.reduce(
    (sum, kr) => sum + keyResultProgress(kr),
    0,
  );
  return Math.round(total / obj.key_results.length);
}
