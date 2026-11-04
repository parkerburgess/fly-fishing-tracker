import { format } from "date-fns";
import type { OutingWithUserName } from "@/types";
import type { ReportOutingDto } from "@/dto";

export function toReportOutingDto(outing: OutingWithUserName): ReportOutingDto {
  return {
    id: String(outing.id),
    dateKey: format(outing.date, "yyyy-MM-dd"),
    dateLabel: format(outing.date, "MMM d"),
    monthKey: format(outing.date, "yyyy-MM"),
    monthLabel: format(outing.date, "MMM yyyy"),
    location: outing.location,
    caught: outing.caught,
    lost: outing.lost,
    missed: outing.missed,
    score: outing.score,
    userId: outing.userId,
    userName: outing.userDisplayName,
  };
}
