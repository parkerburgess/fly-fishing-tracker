import dal from "@/lib/dal";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import { DashboardClient } from "@/components/DashboardClient";
import { toDashboardOutingDto } from "@/lib/hydrate/dashboard";

export default async function DashboardPage() {
  const userId = await getUserId();
  const outings = await dal.getAllOutings();

  return (
    <DashboardClient
      outings={outings.map(toDashboardOutingDto)}
      currentUserId={userId}
    />
  );
}
