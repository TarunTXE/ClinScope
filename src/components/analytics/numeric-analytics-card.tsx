"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import {
  Hash,
  TrendingUp,
  Activity,
  Maximize2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalyzedVariable } from "./types";

interface NumericAnalyticsCardProps {
  variable: AnalyzedVariable;
}

export function NumericAnalyticsCard({ variable }: NumericAnalyticsCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = variable.numericStats;
  if (!stats) return null;

  const hasData = stats.count > 0;

  return (
    <Card className="bg-[#0f1523] border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-700/80">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0f1523]/90">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-teal-950/70 border border-teal-800/40 text-teal-400 flex items-center justify-center shrink-0">
              <Hash className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm sm:text-base font-semibold text-white truncate">
                  {variable.label}
                </CardTitle>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-950/40 text-teal-400 border border-teal-800/30">
                  Numeric
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Section: {variable.sectionTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              n = {stats.count} / {variable.totalRecords}
            </span>
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
              No recorded numerical values available for this variable.
            </div>
          ) : (
            <>
              {/* Statistical Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Count
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-white">
                    {stats.count}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Missing
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-amber-400">
                    {stats.missingCount}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Min
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-200">
                    {stats.min}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Max
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-200">
                    {stats.max}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Mean (μ)
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-teal-400">
                    {stats.mean}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Median
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-cyan-400">
                    {stats.median}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-[#0b101d] border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                    Std Dev (σ)
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-violet-400">
                    {stats.stdDev}
                  </span>
                </div>
              </div>

              {/* Distribution Histogram Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Frequency Distribution</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Range: [{stats.min} ... {stats.max}]
                  </span>
                </div>

                <div className="h-52 w-full pt-2">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.histogram}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="binLabel"
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          tickLine={{ stroke: "#334155" }}
                          axisLine={{ stroke: "#334155" }}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          tickLine={{ stroke: "#334155" }}
                          axisLine={{ stroke: "#334155" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f1523",
                            borderColor: "#334155",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                          }}
                          labelStyle={{ color: "#f8fafc", fontWeight: "bold" }}
                          formatter={(value: any) => [`${value} observation(s)`, "Frequency"]}
                        />
                        <Bar
                          dataKey="count"
                          radius={[6, 6, 0, 0]}
                          fill="#0d9488"
                        >
                          {stats.histogram.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index % 2 === 0
                                  ? "#0d9488"
                                  : "#0f766e"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
