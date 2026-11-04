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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <ScopeToggle
          count={totalOutings}
          showMine={showMine}
          onShowMineChange={setShowMine}
          disabled={!isLoggedIn}
        />
      </div>

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
          <p className="text-2xl font-bold">{totalHours}</p>
          <p className="text-xs text-gray-500">Hours Fished</p>
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
                  {outing.longDate} by{" "}
                  <Link href={`/users/${outing.userId}`} className="hover:underline">
                    {outing.userName}
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
