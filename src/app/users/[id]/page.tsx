import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      outings: { orderBy: { date: "desc" } },
    },
  });

  if (!user) notFound();

  const totalOutings = user.outings.length;
  const totalCaught = user.outings.reduce((sum, o) => sum + o.caught, 0);
  const totalScore = user.outings.reduce((sum, o) => sum + o.score, 0);
  const avgScore = totalOutings > 0 ? Math.round(totalScore / totalOutings) : 0;
  const bestScore = totalOutings > 0 ? Math.max(...user.outings.map((o) => o.score)) : 0;
  const totalMinutes = user.outings.reduce((sum, o) => sum + (o.timeSpentMin || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
      <p className="text-gray-500 text-sm mb-6">
        Member since {format(user.createdAt, "MMMM yyyy")}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="text-center">
          <p className="text-2xl font-bold">{totalOutings}</p>
          <p className="text-xs text-gray-500">Outings</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{totalCaught}</p>
          <p className="text-xs text-gray-500">Fish Caught</p>
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
          <p className="text-2xl font-bold">{Math.round(totalMinutes / 60)}</p>
          <p className="text-xs text-gray-500">Hours Fished</p>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-4">Outings</h2>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Location</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Score</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Caught</th>
            </tr>
          </thead>
          <tbody>
            {user.outings.map((outing) => (
              <tr key={outing.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Link href={`/outings/${outing.id}`} className="text-blue-600 hover:underline">
                    {format(outing.date, "MMM d, yyyy")}
                  </Link>
                </td>
                <td className="py-3 px-4">{outing.location}</td>
                <td className="py-3 px-4 font-semibold">{outing.score}</td>
                <td className="py-3 px-4 text-green-600">{outing.caught}</td>
              </tr>
            ))}
            {user.outings.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No outings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
