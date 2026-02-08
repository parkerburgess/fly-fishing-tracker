import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { ReportsClient } from "@/components/charts/ReportsClient";

export default async function ReportsPage() {
  const session = await auth();

  const allOutings = await prisma.outing.findMany({
    include: { user: true },
    orderBy: { date: "asc" },
  });

  const myOutings = session?.user?.id
    ? allOutings.filter((o) => o.userId === session.user!.id)
    : [];

  const serializeOutings = (outings: typeof allOutings) =>
    outings.map((o) => ({
      id: o.id,
      date: format(o.date, "yyyy-MM-dd"),
      dateLabel: format(o.date, "MMM d"),
      month: format(o.date, "yyyy-MM"),
      monthLabel: format(o.date, "MMM yyyy"),
      location: o.location,
      caught: o.caught,
      lost: o.lost,
      missed: o.missed,
      score: o.score,
      userName: o.user.name,
    }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <ReportsClient
        allOutings={serializeOutings(allOutings)}
        myOutings={serializeOutings(myOutings)}
        isLoggedIn={!!session?.user}
      />
    </div>
  );
}
