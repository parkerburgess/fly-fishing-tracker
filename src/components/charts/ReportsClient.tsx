"use client";

import { useState } from "react";
import { Card } from "@parkerburgess/wandering-parker-ui";
import { ScopeToggle } from "../ScopeToggle";
import { ScoreTrendChart } from "./ScoreTrendChart";
import { CatchBreakdownChart } from "./CatchBreakdownChart";
import type {
  CatchBreakdownPointDto,
  ReportOutingDto,
  ScoreTrendPointDto,
} from "@/dto";

export function ReportsClient({
  outings: allOutings,
  currentUserId,
}: {
  outings: ReportOutingDto[];
  currentUserId: string | null;
}) {
  const [showMine, setShowMine] = useState(false);
  const isLoggedIn = !!currentUserId;
  const outings = showMine && currentUserId
    ? allOutings.filter((o) => o.userId === currentUserId)
    : allOutings;

  // Score trend data, oldest first
  const scoreTrend: ScoreTrendPointDto[] = [...outings]
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .map((o) => ({ date: o.dateLabel, score: o.score }));

  // Catch breakdown - totals
  const totalCaught = outings.reduce((s, o) => s + o.caught, 0);
  const totalLost = outings.reduce((s, o) => s + o.lost, 0);
  const totalMissed = outings.reduce((s, o) => s + o.missed, 0);
  const catchBreakdown: CatchBreakdownPointDto[] = [
    { name: "Total", caught: totalCaught, lost: totalLost, missed: totalMissed },
  ];

  // Location stats
  const locationMap = new Map<string, { count: number; totalScore: number }>();
  for (const o of outings) {
    const existing = locationMap.get(o.location) || { count: 0, totalScore: 0 };
    existing.count++;
    existing.totalScore += o.score;
    locationMap.set(o.location, existing);
  }
  const locationStats = Array.from(locationMap.entries())
    .map(([location, stats]) => ({
      location,
      outings: stats.count,
      avgScore: Math.round(stats.totalScore / stats.count),
    }))
    .sort((a, b) => b.outings - a.outings);

  // Monthly aggregation
  const monthMap = new Map<string, {
    label: string;
    outings: number;
    caught: number;
    lost: number;
    missed: number;
    totalScore: number;
  }>();
  for (const o of outings) {
    const existing = monthMap.get(o.monthKey) || {
      label: o.monthLabel,
      outings: 0,
      caught: 0,
      lost: 0,
      missed: 0,
      totalScore: 0,
    };
    existing.outings++;
    existing.caught += o.caught;
    existing.lost += o.lost;
    existing.missed += o.missed;
    existing.totalScore += o.score;
    monthMap.set(o.monthKey, existing);
  }
  const monthlyData = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);

  // #region Tailwind utility consts
  const pageHeaderCls = "flex justify-between items-center mb-6";
  const titleCls = "text-2xl font-bold";
  const sectionsCls = "space-y-8";
  const emptyTextCls = "text-center text-gray-500 py-8";
  const sectionHeadingCls = "font-semibold mb-4";
  const totalsGridCls = "grid grid-cols-3 gap-4 mt-4 text-center";
  const caughtTotalCls = "text-2xl font-bold text-green-600";
  const lostTotalCls = "text-2xl font-bold text-yellow-600";
  const missedTotalCls = "text-2xl font-bold text-red-600";
  const totalLabelCls = "text-xs text-gray-500";
  const tableScrollCls = "overflow-x-auto";
  const tableCls = "w-full text-sm";
  const headerRowCls = "border-b border-gray-200";
  const headerCellCls = "text-left py-2 px-3 font-medium text-gray-500";
  const bodyRowCls = "border-b border-gray-100";
  const scoreCellCls = "py-2 px-3 font-semibold";
  const caughtCellCls = "py-2 px-3 text-green-600";
  const lostCellCls = "py-2 px-3 text-yellow-600";
  const missedCellCls = "py-2 px-3 text-red-600";
  const cellCls = "py-2 px-3";
  // #endregion

  return (
    <div>
      <div className={pageHeaderCls}>
        <h1 className={titleCls}>Reports</h1>
        <ScopeToggle
          count={outings.length}
          showMine={showMine}
          onShowMineChange={setShowMine}
          disabled={!isLoggedIn}
        />
      </div>

      <div className={sectionsCls}>
      {outings.length === 0 ? (
        <Card>
          <p className={emptyTextCls}>No data to display.</p>
        </Card>
      ) : (
        <>
          {scoreTrend.length > 1 && (
            <Card>
              <h2 className={sectionHeadingCls}>Score Trend Over Time</h2>
              <ScoreTrendChart data={scoreTrend} />
            </Card>
          )}

          <Card>
            <h2 className={sectionHeadingCls}>Catch Breakdown</h2>
            <CatchBreakdownChart data={catchBreakdown} />
            <div className={totalsGridCls}>
              <div>
                <p className={caughtTotalCls}>{totalCaught}</p>
                <p className={totalLabelCls}>Total Caught</p>
              </div>
              <div>
                <p className={lostTotalCls}>{totalLost}</p>
                <p className={totalLabelCls}>Total Lost</p>
              </div>
              <div>
                <p className={missedTotalCls}>{totalMissed}</p>
                <p className={totalLabelCls}>Total Missed</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className={sectionHeadingCls}>Location Stats</h2>
            <div className={tableScrollCls}>
              <table className={tableCls}>
                <thead>
                  <tr className={headerRowCls}>
                    <th className={headerCellCls}>Location</th>
                    <th className={headerCellCls}>Outings</th>
                    <th className={headerCellCls}>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {locationStats.map((loc) => (
                    <tr key={loc.location} className={bodyRowCls}>
                      <td className={cellCls}>{loc.location}</td>
                      <td className={cellCls}>{loc.outings}</td>
                      <td className={scoreCellCls}>{loc.avgScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className={sectionHeadingCls}>Monthly Aggregation</h2>
            <div className={tableScrollCls}>
              <table className={tableCls}>
                <thead>
                  <tr className={headerRowCls}>
                    <th className={headerCellCls}>Month</th>
                    <th className={headerCellCls}>Outings</th>
                    <th className={headerCellCls}>Caught</th>
                    <th className={headerCellCls}>Lost</th>
                    <th className={headerCellCls}>Missed</th>
                    <th className={headerCellCls}>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr key={m.label} className={bodyRowCls}>
                      <td className={cellCls}>{m.label}</td>
                      <td className={cellCls}>{m.outings}</td>
                      <td className={caughtCellCls}>{m.caught}</td>
                      <td className={lostCellCls}>{m.lost}</td>
                      <td className={missedCellCls}>{m.missed}</td>
                      <td className={scoreCellCls}>
                        {Math.round(m.totalScore / m.outings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
      </div>
    </div>
  );
}
