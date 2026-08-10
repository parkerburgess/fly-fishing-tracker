import dal from "@/lib/dal";
import { getUserId } from "@/lib/auth";
import { format } from "date-fns";
import { OutingsTable } from "@/components/outings/OutingsTable";
import type { OutingSortField, SortDir } from "@/types";

export default async function OutingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const { sort, dir } = await searchParams;
  const sortField = (sort as OutingSortField) || "date";
  const sortDir = (dir as SortDir) || "desc";

  const outings = await dal.getAllOutings(sortField, sortDir);
  const userId = await getUserId();

  const serialized = outings.map((o) => ({
    id: String(o.id),
    date: format(o.date, "MMM d, yyyy"),
    location: o.location,
    score: o.score,
    caught: o.caught,
    lost: o.lost,
    missed: o.missed,
    userId: o.userId,
    userName: o.userDisplayName,
  }));

  return (
    <OutingsTable
      outings={serialized}
      currentUserId={userId}
      sortField={sortField}
      sortDir={sortDir}
    />
  );
}
