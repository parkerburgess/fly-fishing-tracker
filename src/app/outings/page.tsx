import dal from "@/lib/dal";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import { OutingsTable } from "@/components/outings/OutingsTable";
import { toOutingsTableRowDto } from "@/lib/hydrate/outings";

export default async function OutingsPage() {
  const outings = await dal.getAllOutings();
  const userId = await getUserId();

  return (
    <OutingsTable
      rows={outings.map(toOutingsTableRowDto)}
      currentUserId={userId}
    />
  );
}
