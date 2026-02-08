"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function CatchBreakdownChart({
  data,
}: {
  data: { name: string; caught: number; lost: number; missed: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Legend />
        <Bar dataKey="caught" fill="#16a34a" name="Caught" />
        <Bar dataKey="lost" fill="#ca8a04" name="Lost" />
        <Bar dataKey="missed" fill="#dc2626" name="Missed" />
      </BarChart>
    </ResponsiveContainer>
  );
}
