// ---------------------------------------------------------------------------
// Month math. The single source of truth for the month-level timeline shared by
// the forms, the objective cards, and the roadmap view.
//
// Months are represented two ways:
//   - 'YYYY-MM'    — what <input type="month"> produces/consumes.
//   - 'YYYY-MM-01' — how we store them (a Postgres DATE pinned to the first).
//
// All parsing slices the string by position, so both shapes are accepted as
// input. We deliberately avoid `new Date(string)` (timezone drift) and locale
// formatting (non-deterministic in CI) — month ordinals and a fixed label table
// keep everything exact.
// ---------------------------------------------------------------------------

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// 'YYYY-MM' or 'YYYY-MM-DD' -> { year, month } with month in 1..12.
function parseYearMonth(s: string): { year: number; month: number } {
  return { year: Number(s.slice(0, 4)), month: Number(s.slice(5, 7)) };
}

// A monotonically increasing integer per calendar month, so month arithmetic is
// plain integer math: ordinal = year * 12 + (month - 1).
function ordinal(s: string): number {
  const { year, month } = parseYearMonth(s);
  return year * 12 + (month - 1);
}

function ordinalToDate(o: number): string {
  const year = Math.floor(o / 12);
  const month = (o % 12) + 1;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`;
}

// '2026-03' -> '2026-03-01' (idempotent if already a full date).
export function monthInputToDate(month: string): string {
  return `${month.slice(0, 7)}-01`;
}

// '2026-03-01' -> '2026-03'.
export function dateToMonthInput(date: string): string {
  return date.slice(0, 7);
}

// '2026-03-01' -> 'Mar 2026'.
export function formatMonthLabel(date: string): string {
  const { year, month } = parseYearMonth(date);
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

// -1 if a < b, 0 if same month, 1 if a > b.
export function compareMonths(a: string, b: string): number {
  return Math.sign(ordinal(a) - ordinal(b));
}

// Whole-month delta (end - start). Inclusive month count is monthDiff + 1.
export function monthDiff(start: string, end: string): number {
  return ordinal(end) - ordinal(start);
}

// Inclusive list of month-firsts from start..end, e.g. ['2026-01-01', ...].
export function enumerateMonths(start: string, end: string): string[] {
  const startOrd = ordinal(start);
  const endOrd = ordinal(end);
  const months: string[] = [];
  for (let o = startOrd; o <= endOrd; o++) {
    months.push(ordinalToDate(o));
  }
  return months;
}

// Zero-based column index of `month` within a timeline that starts at
// `timelineStart`.
export function monthIndex(timelineStart: string, month: string): number {
  return ordinal(month) - ordinal(timelineStart);
}

// True iff [childStart, childEnd] falls fully inside [parentStart, parentEnd]
// (all bounds inclusive). The single rule reused by KeyResultForm and mirrored
// by the database trigger in supabase/schema.sql.
export function isWithin(
  childStart: string,
  childEnd: string,
  parentStart: string,
  parentEnd: string,
): boolean {
  return (
    ordinal(childStart) >= ordinal(parentStart) &&
    ordinal(childEnd) <= ordinal(parentEnd)
  );
}
