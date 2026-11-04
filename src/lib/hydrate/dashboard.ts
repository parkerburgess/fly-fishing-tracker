import { format } from "date-fns";
import type { OutingWithUserName } from "@/types";
import type { DashboardOutingDto } from "@/dto";

export function toDashboardOutingDto(outing: OutingWithUserName): DashboardOutingDto {
  return {
    id: String(outing.id),
    dateKey: format(outing.date, "yyyy-MM-dd"),
    chartLabel: format(outing.date, "MMM d"),
    longDate: format(outing.date, "MMM d, yyyy"),
    location: outing.location,
    score: outing.score,
    caught: outing.caught,
    timeSpentMin: outing.timeSpentMin,
    userId: outing.userId,
    userName: outing.userDisplayName,
  };
}
