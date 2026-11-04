// DTOs are the only contract components know about. They are plain,
// serializable shapes (strings / numbers / null) so any source can
// hydrate them and they survive the server -> client boundary.

export type SortDirection = "asc" | "desc";

export interface OutingsTableRowDto {
  id: string;
  date: string;    // display, "MMM d, yyyy"
  dateKey: string; // sortable, "yyyy-MM-dd"
  location: string;
  score: number;
  caught: number;
  lost: number;
  missed: number;
  userId: string;
  userName: string;
}

export interface OutingFormDto {
  date: string; // "yyyy-MM-dd"
  location: string;
  caught: number;
  lost: number;
  missed: number;
  weather: string;
  waterConditions: string;
  waterTemp: number | null;
  timeSpentMin: number | null;
  notes: string;
}
