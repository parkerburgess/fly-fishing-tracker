import dal from "@/lib/dal";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import { ReportsClient } from "@/components/charts/ReportsClient";
import { toReportOutingDto } from "@/lib/hydrate/reports";

export default async function ReportsPage() {
  const userId = await getUserId();
  const outings = await dal.getAllOutings();

  return (
    <ReportsClient
      outings={outings.map(toReportOutingDto)}
      currentUserId={userId}
    />
  );
}
