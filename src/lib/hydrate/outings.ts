import { format } from "date-fns";
import type { Outing, OutingWithUserName } from "@/types";
import type { OutingFormDto, OutingsTableRowDto } from "@/dto";

// Hydrators only map and cast. No sorting, filtering, or other logic.

export function toOutingsTableRowDto(outing: OutingWithUserName): OutingsTableRowDto {
  return {
    id: String(outing.id),
    date: format(outing.date, "MMM d, yyyy"),
    dateKey: format(outing.date, "yyyy-MM-dd"),
    location: outing.location,
    score: outing.score,
    caught: outing.caught,
    lost: outing.lost,
    missed: outing.missed,
    userId: outing.userId,
    userName: outing.userDisplayName,
  };
}

export function toOutingFormDto(outing: Outing): OutingFormDto {
  return {
    date: format(outing.date, "yyyy-MM-dd"),
    location: outing.location,
    caught: outing.caught,
    lost: outing.lost,
    missed: outing.missed,
    weather: outing.weather ?? "",
    waterConditions: outing.waterConditions ?? "",
    waterTemp: outing.waterTemp,
    timeSpentMin: outing.timeSpentMin,
    notes: outing.notes ?? "",
  };
}
