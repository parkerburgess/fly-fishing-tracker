import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ScoreTrendChart } from "@/components/charts/ScoreTrendChart";

export default async function DashboardPage() {
  const session = await auth();

  const allOutings = await prisma.outing.findMany({
    include: { user: true },
    orderBy: { date: "desc" },
  });

  const totalOutings = allOutings.length;
  const totalCaught = allOutings.reduce((s, o) => s + o.caught, 0);
  const totalScore = allOutings.reduce((s, o) => s + o.score, 0);
  const avgScore = totalOutings > 0 ? Math.round(totalScore / totalOutings) : 0;
  const bestScore = totalOutings > 0 ? Math.max(...allOutings.map((o) => o.score)) : 0;
  const totalMinutes = allOutings.reduce((s, o) => s + (o.timeSpentMin || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);

  const recent = allOutings.slice(0, 5);

  const chartData = [...allOutings]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((o) => ({
      date: format(o.date, "MMM d"),
      score: o.score,
    }));

  let myStats = null;
  if (session?.user?.id) {
    const myOutings = allOutings.filter((o) => o.userId === session.user!.id);
    if (myOutings.length > 0) {
      myStats = {
        totalOutings: myOutings.length,
        totalCaught: myOutings.reduce((s, o) => s + o.caught, 0),
        avgScore: Math.round(myOutings.reduce((s, o) => s + o.score, 0) / myOutings.length),
        bestScore: Math.max(...myOutings.map((o) => o.score)),
        totalHours: Math.round(myOutings.reduce((s, o) => s + (o.timeSpentMin || 0), 0) / 60),
      };
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {myStats && (
        <>
          <h2 className="text-lg font-semibold mb-3">My Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="text-center">
              <p className="text-2xl font-bold">{myStats.totalOutings}</p>
              <p className="text-xs text-gray-500">My Outings</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-green-600">{myStats.totalCaught}</p>
              <p className="text-xs text-gray-500">Fish Caught</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-blue-600">{myStats.avgScore}</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold text-purple-600">{myStats.bestScore}</p>
              <p className="text-xs text-gray-500">Best Score</p>
            </Card>
            <Card className="text-center">
              <p className="text-2xl font-bold">{myStats.totalHours}</p>
              <p className="text-xs text-gray-500">Hours Fished</p>
            </Card>
          </div>
        </>
      )}

      <h2 className="text-lg font-semibold mb-3">Global Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-2xl font-bold">{totalOutings}</p>
          <p className="text-xs text-gray-500">Total Outings</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{totalCaught}</p>
          <p className="text-xs text-gray-500">Total Caught</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-blue-600">{avgScore}</p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-purple-600">{bestScore}</p>
          <p className="text-xs text-gray-500">Best Score</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold">{totalHours}</p>
          <p className="text-xs text-gray-500">Total Hours</p>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card className="mb-8">
          <h2 className="font-semibold mb-4">Score Trend</h2>
          <ScoreTrendChart data={chartData} />
        </Card>
      )}

      <h2 className="text-lg font-semibold mb-3">Recent Outings</h2>
      <Card>
        <div className="divide-y divide-gray-100">
          {recent.map((outing) => (
            <div key={outing.id} className="py-3 flex justify-between items-center">
              <div>
                <Link href={`/outings/${outing.id}`} className="font-medium text-blue-600 hover:underline">
                  {outing.location}
                </Link>
                <p className="text-xs text-gray-500">
                  {format(outing.date, "MMM d, yyyy")} by{" "}
                  <Link href={`/users/${outing.userId}`} className="hover:underline">
                    {outing.user.name}
                  </Link>
                </p>
              </div>
              <span className="font-semibold text-blue-600">{outing.score} pts</span>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="py-8 text-center text-gray-500">No outings yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
