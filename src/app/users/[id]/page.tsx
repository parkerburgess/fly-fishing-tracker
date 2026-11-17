import dal from "@/lib/dal";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Card } from "@parkerburgess/wandering-parker-ui";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await dal.getUserProfile(id);

  if (!profile) notFound();

  // The DAL returns unordered rows; this page shows newest first.
  const unorderedOutings = await dal.getOutingsByUser(id);
  const outings = [...unorderedOutings].sort(
    (left, right) => right.date.getTime() - left.date.getTime()
  );

  const totalOutings = outings.length;
  const totalCaught = outings.reduce((sum, o) => sum + o.caught, 0);
  const totalScore = outings.reduce((sum, o) => sum + o.score, 0);
  const avgScore = totalOutings > 0 ? Math.round(totalScore / totalOutings) : 0;
  const bestScore = totalOutings > 0 ? Math.max(...outings.map((o) => o.score)) : 0;
  const totalMinutes = outings.reduce((sum, o) => sum + (o.timeSpentMin || 0), 0);

  // #region Tailwind utility consts
  const titleCls = "text-2xl font-bold mb-1";
  const memberSinceCls = "text-gray-500 text-sm mb-6";
  const statsGridCls = "grid grid-cols-2 md:grid-cols-5 gap-4 mb-8";
  const statCardCls = "text-center";
  const caughtValueCls = "text-2xl font-bold text-green-600";
  const avgValueCls = "text-2xl font-bold text-blue-600";
  const bestValueCls = "text-2xl font-bold text-purple-600";
  const statValueCls = "text-2xl font-bold";
  const statLabelCls = "text-xs text-gray-500";
  const sectionHeadingCls = "text-lg font-semibold mb-4";
  const tableCardCls = "overflow-x-auto";
  const tableCls = "w-full text-sm";
  const headerRowCls = "border-b border-gray-200";
  const headerCellCls = "text-left py-3 px-4 font-medium text-gray-500";
  const bodyRowCls = "border-b border-gray-100 hover:bg-gray-50";
  const outingLinkCls = "text-blue-600 hover:underline cursor-pointer";
  const scoreCellCls = "py-3 px-4 font-semibold";
  const caughtCellCls = "py-3 px-4 text-green-600";
  const cellCls = "py-3 px-4";
  const emptyRowCls = "py-8 text-center text-gray-500";
  // #endregion

  return (
    <div>
      <h1 className={titleCls}>{profile.displayName}</h1>
      <p className={memberSinceCls}>
        Member since {format(profile.createdAt, "MMMM yyyy")}
      </p>

      <div className={statsGridCls}>
        <Card className={statCardCls}>
          <p className={statValueCls}>{totalOutings}</p>
          <p className={statLabelCls}>Outings</p>
        </Card>
        <Card className={statCardCls}>
          <p className={caughtValueCls}>{totalCaught}</p>
          <p className={statLabelCls}>Fish Caught</p>
        </Card>
        <Card className={statCardCls}>
          <p className={avgValueCls}>{avgScore}</p>
          <p className={statLabelCls}>Avg Score</p>
        </Card>
        <Card className={statCardCls}>
          <p className={bestValueCls}>{bestScore}</p>
          <p className={statLabelCls}>Best Score</p>
        </Card>
        <Card className={statCardCls}>
          <p className={statValueCls}>{Math.round(totalMinutes / 60)}</p>
          <p className={statLabelCls}>Hours Fished</p>
        </Card>
      </div>

      <h2 className={sectionHeadingCls}>Outings</h2>
      <Card className={tableCardCls}>
        <table className={tableCls}>
          <thead>
            <tr className={headerRowCls}>
              <th className={headerCellCls}>Date</th>
              <th className={headerCellCls}>Location</th>
              <th className={headerCellCls}>Score</th>
              <th className={headerCellCls}>Caught</th>
            </tr>
          </thead>
          <tbody>
            {outings.map((outing) => (
              <tr key={outing.id} className={bodyRowCls}>
                <td className={cellCls}>
                  <Link href={`/outings/${outing.id}`} className={outingLinkCls}>
                    {format(outing.date, "MMM d, yyyy")}
                  </Link>
                </td>
                <td className={cellCls}>{outing.location}</td>
                <td className={scoreCellCls}>{outing.score}</td>
                <td className={caughtCellCls}>{outing.caught}</td>
              </tr>
            ))}
            {outings.length === 0 && (
              <tr>
                <td colSpan={4} className={emptyRowCls}>
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
