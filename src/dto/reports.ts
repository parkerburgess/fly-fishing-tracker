export interface ReportOutingDto {
  id: string;
  dateKey: string;    // sortable, "yyyy-MM-dd"
  dateLabel: string;  // "MMM d"
  monthKey: string;   // sortable, "yyyy-MM"
  monthLabel: string; // "MMM yyyy"
  location: string;
  caught: number;
  lost: number;
  missed: number;
  score: number;
  userId: string;
  userName: string;
}
