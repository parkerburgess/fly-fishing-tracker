import type { SortDirection } from "@/dto";

type SortableValue = string | number | null;

function compareValues(left: SortableValue, right: SortableValue): number {
  // Nulls always sort last, regardless of direction.
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right));
}

// Returns a comparator for any DTO property. Works for every key whose
// value is a string, number, or null, so no per-field sort list is needed.
export function compareBy<TRow, TKey extends keyof TRow>(
  key: TKey,
  direction: SortDirection
): (left: TRow, right: TRow) => number {
  const multiplier = direction === "asc" ? 1 : -1;

  function compareRows(left: TRow, right: TRow): number {
    const leftValue = left[key] as SortableValue;
    const rightValue = right[key] as SortableValue;
    if (leftValue === null || rightValue === null) {
      return compareValues(leftValue, rightValue);
    }
    return compareValues(leftValue, rightValue) * multiplier;
  }

  return compareRows;
}

export function parseSortDirection(
  value: string | null,
  fallback: SortDirection
): SortDirection {
  if (value === "asc" || value === "desc") return value;
  return fallback;
}
