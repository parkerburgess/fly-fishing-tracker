import dal from "@/lib/dal";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { ReportsClient } from "@/components/charts/ReportsClient";
import type { OutingWithUserName } from "@/types";

export default async function ReportsPage() {
  const userId = await getUserId();

  const allOutings = await dal.getAllOutings("date", "asc");

  const myOutings = allOutings.filter((o) => o.userId === userId);

  const serializeOutings = (outings: OutingWithUserName[]) =>
    outings.map((o) => ({
      id: String(o.id),
      date: format(o.date, "yyyy-MM-dd"),
      dateLabel: format(o.date, "MMM d"),
      month: format(o.date, "yyyy-MM"),
      monthLabel: format(o.date, "MMM yyyy"),
      location: o.location,
      caught: o.caught,
      lost: o.lost,
      missed: o.missed,
      score: o.score,
      userName: o.userDisplayName,
    }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <ReportsClient
        allOutings={serializeOutings(allOutings)}
        myOutings={serializeOutings(myOutings)}
        isLoggedIn={true}
      />
    </div>
  );
}
