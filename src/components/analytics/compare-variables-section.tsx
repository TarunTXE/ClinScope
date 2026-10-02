"use client";

import * as React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts";
import {
  GitCompare,
  ArrowRightLeft,
  Info,
  HelpCircle,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormSchema, ResearchRecord } from "@/lib/supabase/types";
import { AnalyzedVariable } from "./types";
import { compareVariables } from "./analytics-utils";

interface CompareVariablesSectionProps {
  schema: FormSchema;
  records: ResearchRecord[];
  variables: AnalyzedVariable[];
}

const PALETTE = [
  "#0d9488",
  "#06b6d4",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

export function CompareVariablesSection({
  schema,
  records,
  variables,
}: CompareVariablesSectionProps) {
  const [selectedKeyA, setSelectedKeyA] = React.useState<string>("");
  const [selectedKeyB, setSelectedKeyB] = React.useState<string>("");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize default selections when variables load
  React.useEffect(() => {
    if (variables.length >= 2 && (!selectedKeyA || !selectedKeyB)) {
      setSelectedKeyA(variables[0].key);
      setSelectedKeyB(variables[1].key);
    }
  }, [variables, selectedKeyA, selectedKeyB]);

  const varA = React.useMemo(
    () => variables.find((v) => v.key === selectedKeyA),
    [variables, selectedKeyA]
  );
  const varB = React.useMemo(
    () => variables.find((v) => v.key === selectedKeyB),
    [variables, selectedKeyB]
  );

  const comparison = React.useMemo(() => {
    if (!varA || !varB || !schema) return null;
    return compareVariables(varA, varB, schema, records);
  }, [varA, varB, schema, records]);

  return (
    <Card className="bg-[#0f1523] border-slate-800 shadow-sm">
      <CardHeader className="p-5 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 flex items-center justify-center">
                <GitCompare className="w-3.5 h-3.5" />
              </div>
              <CardTitle className="text-base text-white font-semibold">
                Compare Variables
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Interactive cross-variable distribution and relationship visualization
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              Total Observations: {records.length}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Variable Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#0b101d] border border-slate-800/80">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              Variable A (Independent / Grouping)
            </label>
            <select
              value={selectedKeyA}
              onChange={(e) => setSelectedKeyA(e.target.value)}
              className="w-full text-xs bg-[#0f1523] border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 font-medium"
            >
              {variables.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.label} ({v.inferredType}) - {v.sectionTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Variable B (Dependent / Comparison)
            </label>
            <select
              value={selectedKeyB}
              onChange={(e) => setSelectedKeyB(e.target.value)}
              className="w-full text-xs bg-[#0f1523] border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 font-medium"
            >
              {variables.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.label} ({v.inferredType}) - {v.sectionTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Result Area */}
        {!varA || !varB ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Select two variables to compare.
          </div>
        ) : selectedKeyA === selectedKeyB ? (
          <div className="py-10 text-center text-xs text-amber-400 bg-amber-950/20 border border-amber-800/40 rounded-xl p-4">
            Please select two different variables for comparison.
          </div>
        ) : !comparison || comparison.sampleSize === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-[#0b101d]/40 rounded-xl p-6">
            No complete paired records found for {varA.label} and {varB.label}.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Context Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{varA.label}</span>
                <span className="text-slate-500 font-mono">vs</span>
                <span className="font-semibold text-white">{varB.label}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 ml-2">
                  {comparison.type.replace(/-/g, " ")}
                </span>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">
                Paired observations: {comparison.sampleSize}
              </span>
            </div>

            {/* 1. SCATTER PLOT: Numeric vs Numeric */}
            {comparison.type === "numeric-vs-numeric" && (
              <div className="space-y-2">
                <div className="h-72 w-full pt-2">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name={comparison.xLabel}
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={{ stroke: "#334155" }}
                          axisLine={{ stroke: "#334155" }}
                          label={{
                            value: comparison.xLabel,
                            position: "insideBottom",
                            offset: -10,
                            fill: "#94a3b8",
                            fontSize: 11,
                          }}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name={comparison.yLabel}
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={{ stroke: "#334155" }}
                          axisLine={{ stroke: "#334155" }}
                          label={{
                            value: comparison.yLabel,
                            angle: -90,
                            position: "insideLeft",
                            fill: "#94a3b8",
                            fontSize: 11,
                          }}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3", stroke: "#0d9488" }}
                          contentStyle={{
                            backgroundColor: "#0f1523",
                            borderColor: "#334155",
                            borderRadius: "0.75rem",
                            fontSize: "12px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                          }}
                          formatter={(value: any, name: any, item: any) => [
                            `${value}`,
                            name,
                          ]}
                          labelFormatter={() => `Record ID`}
                        />
                        <Scatter
                          name="Records"
                          data={comparison.data}
                          fill="#0d9488"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* 2. GROUPED BAR SUMMARY: Categorical vs Numeric */}
            {comparison.type === "categorical-vs-numeric" && (
              <div className="space-y-3">
                <div className="h-72 w-full pt-2">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparison.data}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="category"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={{ stroke: "#334155" }}
                          axisLine={{ stroke: "#334155" }}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={{ stroke: "#334155" }}
                          axisLine={{ stroke: "#334155" }}
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
                            `Mean: ${value} (n = ${item.payload.count}, Range: ${item.payload.min} - ${item.payload.max})`,
                            comparison.numLabel,
                          ]}
                        />
                        <Bar
                          dataKey="mean"
                          name={`Mean ${comparison.numLabel}`}
                          radius={[6, 6, 0, 0]}
                        >
                          {comparison.data.map((entry, index) => (
                            <Cell
                              key={`cat-num-cell-${index}`}
                              fill={PALETTE[index % PALETTE.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Sub table breakdown */}
                <div className="rounded-xl border border-slate-800/80 bg-[#0b101d]/60 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#0f1523] text-slate-400 font-medium border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">{comparison.catLabel}</th>
                        <th className="py-2 px-3 text-center">Sample Count</th>
                        <th className="py-2 px-3 text-center">Mean (μ)</th>
                        <th className="py-2 px-3 text-center">Min</th>
                        <th className="py-2 px-3 text-right">Max</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {comparison.data.map((row: any, idx: number) => (
                        <tr key={row.category} className="hover:bg-slate-800/20">
                          <td className="py-2 px-3 font-medium text-white flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                            />
                            <span>{row.category}</span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{row.count}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-teal-400">
                            {row.mean}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">{row.min}</td>
                          <td className="py-2 px-3 text-right font-mono">{row.max}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. GROUPED BAR: Categorical vs Categorical */}
            {comparison.type === "categorical-vs-categorical" && (
              <div className="space-y-3">
                <div className="h-72 w-full pt-2">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparison.data}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="categoryA"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          tickLine={{ stroke: "#334155" }}
                          axisLine={{ stroke: "#334155" }}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
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
                        />
                        <Legend
                          iconType="circle"
                          formatter={(value: any) => (
                            <span className="text-[11px] text-slate-300">{value}</span>
                          )}
                        />
                        {comparison.keysB.map((bKey: string, index: number) => (
                          <Bar
                            key={bKey}
                            dataKey={bKey}
                            name={bKey}
                            fill={PALETTE[index % PALETTE.length]}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Cross-tabulation table */}
                <div className="rounded-xl border border-slate-800/80 bg-[#0b101d]/60 overflow-hidden">
                  <div className="p-2.5 bg-[#0f1523] border-b border-slate-800 text-[11px] text-slate-400 font-medium">
                    Cross-Tabulation Matrix: {comparison.catALabel} × {comparison.catBLabel}
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#0f1523]/60 text-slate-400 font-medium border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">{comparison.catALabel}</th>
                        {comparison.keysB.map((k: string) => (
                          <th key={k} className="py-2 px-3 text-center">
                            {k}
                          </th>
                        ))}
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {comparison.data.map((row: any) => (
                        <tr key={row.categoryA} className="hover:bg-slate-800/20">
                          <td className="py-2 px-3 font-medium text-white">
                            {row.categoryA}
                          </td>
                          {comparison.keysB.map((k: string) => (
                            <td key={k} className="py-2 px-3 text-center font-mono">
                              {row[k] || 0}
                            </td>
                          ))}
                          <td className="py-2 px-3 text-right font-mono font-semibold text-teal-400">
                            {row.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
