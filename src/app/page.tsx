import dal from "@/lib/dal";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import { format } from "date-fns";
import { DashboardClient } from "@/components/DashboardClient";
import type { OutingWithUserName } from "@/types";

export default async function DashboardPage() {
  const userId = await getUserId();

  const allOutings = await dal.getAllOutings("date", "desc");
  const myOutings = allOutings.filter((o) => o.userId === userId);

  const serializeOutings = (outings: OutingWithUserName[]) =>
    outings.map((o) => ({
      id: String(o.id),
      dateKey: format(o.date, "yyyy-MM-dd"),
      chartLabel: format(o.date, "MMM d"),
      longDate: format(o.date, "MMM d, yyyy"),
      location: o.location,
      score: o.score,
      caught: o.caught,
      timeSpentMin: o.timeSpentMin,
      userId: o.userId,
      userName: o.userDisplayName,
    }));

  return (
    <DashboardClient
      allOutings={serializeOutings(allOutings)}
      myOutings={serializeOutings(myOutings)}
      isLoggedIn={!!userId}
    />
  );
}
