"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ScoreDistribution } from "@/lib/types/analytics";

// A varied palette so each score bucket gets its own color. Ordered from
// low scores (warm/red) to high scores (cool/green) so the chart also reads
// as a low→high performance gradient.
const BAR_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#7c3aed", // violet-600
  "#6366f1", // indigo-500
  "#3b82f6", // blue-500
];

interface ScoreDistributionChartProps {
  data: ScoreDistribution | null;
  isLoading: boolean;
}

function Skeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm animate-pulse h-80">
      <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
      <div className="h-56 bg-gray-200 rounded" />
    </div>
  );
}

export function ScoreDistributionChart({ data, isLoading }: ScoreDistributionChartProps) {
  if (isLoading || !data) {
    return <Skeleton />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm h-80">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
        Score Distribution
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={(data?.buckets || []).map((bucket, index) => ({ ...bucket, key: `${bucket.label}-${bucket.min}-${bucket.max}-${index}` }))} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {(data?.buckets || []).map((bucket, index) => (
                <Cell
                  key={`${bucket.label}-${bucket.min}-${bucket.max}-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
