"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SortableHeader } from "./SortableHeader";

interface OutingRow {
  id: string;
  date: string;
  location: string;
  score: number;
  caught: number;
  lost: number;
  missed: number;
  userId: string;
  userName: string;
}

export function OutingsTable({
  outings,
  currentUserId,
  sortField,
  sortDir,
}: {
  outings: OutingRow[];
  currentUserId: string | null;
  sortField: string;
  sortDir: string;
}) {
  const [showMine, setShowMine] = useState(!!currentUserId);

  const filtered = showMine && currentUserId
    ? outings.filter((o) => o.userId === currentUserId)
    : outings;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {showMine && currentUserId ? "My Outings" : "All Outings"}
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{filtered.length} outings</span>
          <div className="flex gap-1">
            <Button
              variant={showMine && currentUserId ? "secondary" : "primary"}
              onClick={() => setShowMine(false)}
              disabled={!currentUserId}
              className="text-sm px-3 py-1"
            >
              All
            </Button>
            <Button
              variant={showMine && currentUserId ? "primary" : "secondary"}
              onClick={() => setShowMine(true)}
              disabled={!currentUserId}
              className="text-sm px-3 py-1"
            >
              Mine
            </Button>
          </div>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <SortableHeader field="date" current={sortField} dir={sortDir}>Date</SortableHeader>
              <SortableHeader field="location" current={sortField} dir={sortDir}>Location</SortableHeader>
              <SortableHeader field="score" current={sortField} dir={sortDir}>Score</SortableHeader>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Caught</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Lost</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Missed</th>
              <SortableHeader field="author" current={sortField} dir={sortDir}>Author</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {filtered.map((outing) => (
              <tr key={outing.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Link href={`/outings/${outing.id}`} className="text-blue-600 hover:underline">
                    {outing.date}
                  </Link>
                </td>
                <td className="py-3 px-4">{outing.location}</td>
                <td className="py-3 px-4 font-semibold">{outing.score}</td>
                <td className="py-3 px-4 text-green-600">{outing.caught}</td>
                <td className="py-3 px-4 text-yellow-600">{outing.lost}</td>
                <td className="py-3 px-4 text-red-600">{outing.missed}</td>
                <td className="py-3 px-4">
                  <Link href={`/users/${outing.userId}`} className="hover:underline">
                    {outing.userName}
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No outings yet. Be the first to log one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
