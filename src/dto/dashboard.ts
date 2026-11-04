export interface DashboardOutingDto {
  id: string;
  dateKey: string;    // sortable, "yyyy-MM-dd"
  chartLabel: string; // "MMM d"
  longDate: string;   // "MMM d, yyyy"
  location: string;
  score: number;
  caught: number;
  timeSpentMin: number | null;
  userId: string;
  userName: string;
}
