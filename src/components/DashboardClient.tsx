"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@parkerburgess/wandering-parker-ui";
import { ScopeToggle } from "./ScopeToggle";
import type { DashboardOutingDto, ScoreTrendPointDto } from "@/dto";
import { ScoreTrendChart } from "./charts/ScoreTrendChart";

export function DashboardClient({
  outings: allOutings,
  currentUserId,
}: {
  outings: DashboardOutingDto[];
  currentUserId: string | null;
}) {
  const [showMine, setShowMine] = useState(false);
  const isLoggedIn = !!currentUserId;
  const outings = showMine && currentUserId
    ? allOutings.filter((o) => o.userId === currentUserId)
    : allOutings;

  const totalOutings = outings.length;
  const totalCaught = outings.reduce((s, o) => s + o.caught, 0);
  const totalScore = outings.reduce((s, o) => s + o.score, 0);
  const avgScore = totalOutings > 0 ? Math.round(totalScore / totalOutings) : 0;
  const bestScore = totalOutings > 0 ? Math.max(...outings.map((o) => o.score)) : 0;
  const totalMinutes = outings.reduce((s, o) => s + (o.timeSpentMin || 0), 0);
  const totalHours = Math.round(totalMinutes / 60);

  const chartData: ScoreTrendPointDto[] = [...outings]
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((o) => ({ date: o.chartLabel, score: o.score }));

  const recent = [...outings]
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
    .slice(0, 5);

  // #region Tailwind utility consts
  const pageHeaderCls = "flex justify-between items-center mb-6";
  const titleCls = "text-2xl font-bold";
  const statsGridCls = "grid grid-cols-2 md:grid-cols-5 gap-4 mb-8";
  const statCardCls = "text-center";
  const statValueCls = "text-2xl font-bold";
  const caughtValueCls = "text-2xl font-bold text-green-600";
  const avgValueCls = "text-2xl font-bold text-blue-600";
  const bestValueCls = "text-2xl font-bold text-purple-600";
  const statLabelCls = "text-xs text-gray-500";
  const chartCardCls = "mb-8";
  const chartHeadingCls = "font-semibold mb-4";
  const recentHeadingCls = "text-lg font-semibold mb-3";
  const recentListCls = "divide-y divide-gray-100";
  const recentRowCls = "py-3 flex justify-between items-center";
  const outingLinkCls = "font-medium text-blue-600 hover:underline cursor-pointer";
  const recentMetaCls = "text-xs text-gray-500";
  const userLinkCls = "hover:underline cursor-pointer";
  const recentScoreCls = "font-semibold text-blue-600";
  const emptyTextCls = "py-8 text-center text-gray-500";
  // #endregion

  return (
    <div>
      <div className={pageHeaderCls}>
        <h1 className={titleCls}>Dashboard</h1>
        <ScopeToggle
          count={totalOutings}
          showMine={showMine}
          onShowMineChange={setShowMine}
          disabled={!isLoggedIn}
        />
      </div>

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
          <p className={statValueCls}>{totalHours}</p>
          <p className={statLabelCls}>Hours Fished</p>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card className={chartCardCls}>
          <h2 className={chartHeadingCls}>Score Trend</h2>
          <ScoreTrendChart data={chartData} />
        </Card>
      )}

      <h2 className={recentHeadingCls}>Recent Outings</h2>
      <Card>
        <div className={recentListCls}>
          {recent.map((outing) => (
            <div key={outing.id} className={recentRowCls}>
              <div>
                <Link href={`/outings/${outing.id}`} className={outingLinkCls}>
                  {outing.location}
                </Link>
                <p className={recentMetaCls}>
                  {outing.longDate} by{" "}
                  <Link href={`/users/${outing.userId}`} className={userLinkCls}>
                    {outing.userName}
                  </Link>
                </p>
              </div>
              <span className={recentScoreCls}>{outing.score} pts</span>
            </div>
          ))}
          {recent.length === 0 && (
            <p className={emptyTextCls}>No outings yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
