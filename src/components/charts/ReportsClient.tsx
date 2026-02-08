"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreTrendChart } from "./ScoreTrendChart";
import { CatchBreakdownChart } from "./CatchBreakdownChart";

interface OutingData {
  id: string;
  date: string;
  dateLabel: string;
  month: string;
  monthLabel: string;
  location: string;
  caught: number;
  lost: number;
  missed: number;
  score: number;
  userName: string;
}

export function ReportsClient({
  allOutings,
  myOutings,
  isLoggedIn,
}: {
  allOutings: OutingData[];
  myOutings: OutingData[];
  isLoggedIn: boolean;
}) {
  const [showMine, setShowMine] = useState(false);
  const outings = showMine ? myOutings : allOutings;

  // Score trend data
  const scoreTrend = outings.map((o) => ({
    date: o.dateLabel,
    score: o.score,
  }));

  // Catch breakdown - totals
  const totalCaught = outings.reduce((s, o) => s + o.caught, 0);
  const totalLost = outings.reduce((s, o) => s + o.lost, 0);
  const totalMissed = outings.reduce((s, o) => s + o.missed, 0);
  const catchBreakdown = [
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
    const existing = monthMap.get(o.month) || {
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
    monthMap.set(o.month, existing);
  }
  const monthlyData = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data);

  return (
    <div className="space-y-8">
      {isLoggedIn && (
        <div className="flex gap-2">
          <Button
            variant={showMine ? "secondary" : "primary"}
            onClick={() => setShowMine(false)}
          >
            All Users
          </Button>
          <Button
            variant={showMine ? "primary" : "secondary"}
            onClick={() => setShowMine(true)}
          >
            My Outings
          </Button>
        </div>
      )}

      {outings.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No data to display.</p>
        </Card>
      ) : (
        <>
          {scoreTrend.length > 1 && (
            <Card>
              <h2 className="font-semibold mb-4">Score Trend Over Time</h2>
              <ScoreTrendChart data={scoreTrend} />
            </Card>
          )}

          <Card>
            <h2 className="font-semibold mb-4">Catch Breakdown</h2>
            <CatchBreakdownChart data={catchBreakdown} />
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{totalCaught}</p>
                <p className="text-xs text-gray-500">Total Caught</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{totalLost}</p>
                <p className="text-xs text-gray-500">Total Lost</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{totalMissed}</p>
                <p className="text-xs text-gray-500">Total Missed</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold mb-4">Location Stats</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Location</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Outings</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {locationStats.map((loc) => (
                    <tr key={loc.location} className="border-b border-gray-100">
                      <td className="py-2 px-3">{loc.location}</td>
                      <td className="py-2 px-3">{loc.outings}</td>
                      <td className="py-2 px-3 font-semibold">{loc.avgScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold mb-4">Monthly Aggregation</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Month</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Outings</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Caught</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Lost</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Missed</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => (
                    <tr key={m.label} className="border-b border-gray-100">
                      <td className="py-2 px-3">{m.label}</td>
                      <td className="py-2 px-3">{m.outings}</td>
                      <td className="py-2 px-3 text-green-600">{m.caught}</td>
                      <td className="py-2 px-3 text-yellow-600">{m.lost}</td>
                      <td className="py-2 px-3 text-red-600">{m.missed}</td>
                      <td className="py-2 px-3 font-semibold">
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
  );
}
