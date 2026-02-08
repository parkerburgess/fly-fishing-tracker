export function calculateScore(caught: number, lost: number, missed: number): number {
  return caught * 5 + lost * 3 + missed * 1;
}
