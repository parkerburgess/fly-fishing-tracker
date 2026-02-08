import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { OutingsTable } from "@/components/outings/OutingsTable";

type SortField = "date" | "location" | "score" | "author";
type SortDir = "asc" | "desc";

export default async function OutingsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const { sort, dir } = await searchParams;
  const sortField = (sort as SortField) || "date";
  const sortDir = (dir as SortDir) || "desc";

  const orderBy: Record<string, unknown> =
    sortField === "author"
      ? { user: { name: sortDir } }
      : { [sortField]: sortDir };

  const outings = await prisma.outing.findMany({
    include: { user: true },
    orderBy,
  });

  const session = await auth();

  const serialized = outings.map((o) => ({
    id: o.id,
    date: format(o.date, "MMM d, yyyy"),
    location: o.location,
    score: o.score,
    caught: o.caught,
    lost: o.lost,
    missed: o.missed,
    userId: o.userId,
    userName: o.user.name,
  }));

  return (
    <OutingsTable
      outings={serialized}
      currentUserId={session?.user?.id ?? null}
      sortField={sortField}
      sortDir={sortDir}
    />
  );
}
