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

export type OkrStatus = 'on-track' | 'at-risk' | 'off-track';

// Pace-based OKR status: compares actual progress against the progress we'd
// expect by `today` given a linear burn across the [startsOn, endsOn] window.
// Dates are 'YYYY-MM' or 'YYYY-MM-01' and parsed by string slice (matching
// src/lib/dates.ts) to avoid timezone drift; endsOn is the INCLUSIVE last month.
// Pure: depends only on its arguments.
export function okrStatus(
  progressPct: number,
  startsOn: string | null | undefined,
  endsOn: string | null | undefined,
  today: Date = new Date(),
): OkrStatus {
  // Simple thresholds used when we can't pace against a valid window.
  const fallback = (): OkrStatus =>
    progressPct >= 70 ? 'on-track' : progressPct >= 40 ? 'at-risk' : 'off-track';

  if (progressPct >= 100) return 'on-track';

  if (!startsOn || !endsOn) return fallback();

  const startYear = Number(startsOn.slice(0, 4));
  const startMonth = Number(startsOn.slice(5, 7));
  const endYear = Number(endsOn.slice(0, 4));
  const endMonth = Number(endsOn.slice(5, 7));
  if (
    !Number.isFinite(startYear) ||
    !Number.isFinite(startMonth) ||
    !Number.isFinite(endYear) ||
    !Number.isFinite(endMonth)
  ) {
    return fallback();
  }

  // startMonth/endMonth are 1..12; the Date constructor wants a 0-based month
  // index. windowEnd is the first day of the month AFTER endsOn (inclusive end).
  const windowStart = new Date(startYear, startMonth - 1, 1);
  const windowEnd = new Date(endYear, endMonth, 1);

  if (windowEnd.getTime() <= windowStart.getTime()) return fallback();

  if (today.getTime() < windowStart.getTime()) return 'on-track';

  const span = windowEnd.getTime() - windowStart.getTime();
  const raw = (today.getTime() - windowStart.getTime()) / span;
  const elapsed = Math.max(0, Math.min(1, raw));
  const expected = elapsed * 100;
  const gap = progressPct - expected;

  return gap >= -10 ? 'on-track' : gap >= -25 ? 'at-risk' : 'off-track';
}
