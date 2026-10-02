"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import {
  PieChart as PieIcon,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Table as TableIcon
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyzedVariable } from "./types";

interface CategoricalAnalyticsCardProps {
  variable: AnalyzedVariable;
}

const PALETTE = [
  "#0d9488", // teal
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f97316", // orange
  "#14b8a6", // teal-light
];

export function CategoricalAnalyticsCard({ variable }: CategoricalAnalyticsCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [chartView, setChartView] = React.useState<"bar" | "donut">("bar");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = variable.categoricalStats;
  if (!stats) return null;

  const hasData = stats.validCount > 0;

  return (
    <Card className="bg-[#0f1523] border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-700/80">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0f1523]/90">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-violet-950/70 border border-violet-800/40 text-violet-400 flex items-center justify-center shrink-0">
              <PieIcon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-semibold text-white truncate">
                  {variable.label}
                </CardTitle>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet-950/40 text-violet-400 border border-violet-800/30">
                  {variable.inferredType}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Section: {variable.sectionTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasData && (
              <div className="flex items-center rounded-lg bg-[#0b101d] border border-slate-800 p-0.5">
                <button
                  onClick={() => setChartView("bar")}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 ${
                    chartView === "bar"
                      ? "bg-slate-800 text-teal-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Bar View"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span className="hidden sm:inline">Bar</span>
                </button>
                <button
                  onClick={() => setChartView("donut")}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 ${
                    chartView === "donut"
                      ? "bg-slate-800 text-teal-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Donut View"
                >
                  <PieIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">Donut</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle details"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 sm:p-5 space-y-5">
          {!hasData ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recorded categorical responses available for this variable.
            </div>
          ) : (
            <>
              {/* Summary Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Valid Responses
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-white">
                    {stats.validCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Missing Responses
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                    {stats.missingCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Categories
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-violet-400">
                    {stats.frequencies.length}
                  </span>
                </div>
              </div>

              {/* Chart & Table Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
                {/* Visual Chart */}
                <div className="h-56 w-full pt-1">
                  {isMounted && (
                    <>
                      {chartView === "bar" ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stats.frequencies}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#1e293b"
                              horizontal={false}
                            />
                            <XAxis
                              type="number"
                              tick={{ fill: "#94a3b8", fontSize: 10 }}
                              tickLine={{ stroke: "#334155" }}
                              axisLine={{ stroke: "#334155" }}
                              allowDecimals={false}
                            />
                            <YAxis
                              dataKey="name"
                              type="category"
                              tick={{ fill: "#cbd5e1", fontSize: 11 }}
                              tickLine={{ stroke: "#334155" }}
                              axisLine={{ stroke: "#334155" }}
                              width={90}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f1523",
                                borderColor: "#334155",
                                borderRadius: "0.75rem",
                                fontSize: "12px",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                              }}
                              formatter={(value: any, name: any, item: any) => [
                                `${value} (${item.payload.percentage}%)`,
                                "Count",
                              ]}
                            />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                              {stats.frequencies.map((entry, index) => (
                                <Cell
                                  key={`bar-cell-${index}`}
                                  fill={PALETTE[index % PALETTE.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.frequencies}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="count"
                            >
                              {stats.frequencies.map((entry, index) => (
                                <Cell
                                  key={`pie-cell-${index}`}
                                  fill={PALETTE[index % PALETTE.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f1523",
                                borderColor: "#334155",
                                borderRadius: "0.75rem",
                                fontSize: "12px",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                              }}
                              formatter={(value: any, name: any, item: any) => [
                                `${value} observations (${item.payload.percentage}%)`,
                                item.payload.name,
                              ]}
                            />
                            <Legend
                              iconType="circle"
                              formatter={(value: any) => (
                                <span className="text-[11px] text-slate-300">{value}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </>
                  )}
                </div>

                {/* Breakdown Table */}
                <div className="rounded-xl border border-slate-800/80 bg-[#0b101d]/60 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#0f1523] text-slate-400 font-medium border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Option / Value</th>
                        <th className="py-2 px-3 text-center">Count</th>
                        <th className="py-2 px-3 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {stats.frequencies.map((freq, idx) => (
                        <tr key={freq.name} className="hover:bg-slate-800/20">
                          <td className="py-2 px-3 font-medium text-white flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                            />
                            <span className="truncate max-w-[140px]">{freq.name}</span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{freq.count}</td>
                          <td className="py-2 px-3 text-right font-mono text-teal-400">
                            {freq.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
