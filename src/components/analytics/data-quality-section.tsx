"use client";

import * as React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AnalyzedVariable, StudyAnalyticsOverview } from "./types";

interface DataQualitySectionProps {
  overview: StudyAnalyticsOverview;
  variables: AnalyzedVariable[];
}

export function DataQualitySection({ overview, variables }: DataQualitySectionProps) {
  const [filterQuery, setFilterQuery] = React.useState("");
  const [filterMissingOnly, setFilterMissingOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"missingDesc" | "name" | "section">("missingDesc");

  const highMissingVariables = React.useMemo(
    () => variables.filter((v) => v.missingPercentage > 30),
    [variables]
  );

  const filteredVariables = React.useMemo(() => {
    return variables
      .filter((v) => {
        const matchesQuery =
          v.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
          v.sectionTitle.toLowerCase().includes(filterQuery.toLowerCase());
        if (!matchesQuery) return false;
        if (filterMissingOnly) return v.missingCount > 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "missingDesc") {
          return b.missingPercentage - a.missingPercentage;
        }
        if (sortBy === "name") {
          return a.label.localeCompare(b.label);
        }
        return a.sectionTitle.localeCompare(b.sectionTitle);
      });
  }, [variables, filterQuery, filterMissingOnly, sortBy]);

  return (
    <Card className="bg-[#0f1523] border-slate-800 shadow-sm">
      <CardHeader className="p-5 border-b border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/40 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <CardTitle className="text-base text-white font-semibold">
                Data Quality & Completeness
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Field-level completeness monitoring and missing value distribution across the study
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Overall Completeness</div>
              <div className="text-lg font-bold text-teal-400">
                {overview.overallCompletionRate}%
              </div>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden shrink-0">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overview.overallCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* High Missingness Warning Banner if applicable */}
        {highMissingVariables.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-amber-300 block">
                {highMissingVariables.length} variable(s) with high missingness (&gt; 30%)
              </span>
              <p className="text-slate-300 leading-relaxed">
                The following variables have missing responses exceeding 30% of records:{" "}
                <span className="text-white font-medium">
                  {highMissingVariables.map((v) => v.label).join(", ")}
                </span>
                . Consider checking collection protocols for these fields.
              </p>
            </div>
          </div>
        )}

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search variables..."
              className="pl-8 text-xs h-8 bg-[#0b101d] border-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setFilterMissingOnly(!filterMissingOnly)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                filterMissingOnly
                  ? "bg-amber-950/40 text-amber-300 border-amber-800/60"
                  : "bg-[#0b101d] text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Missing Values Only</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-[#0b101d] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
            >
              <option value="missingDesc">Sort by Missingness</option>
              <option value="name">Sort by Field Name</option>
              <option value="section">Sort by Section</option>
            </select>
          </div>
        </div>

        {/* Variable Quality Table / List */}
        <div className="rounded-xl border border-slate-800/80 bg-[#0b101d]/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0f1523]/80 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Variable / Field</th>
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Responses</th>
                  <th className="py-2.5 px-3 text-center">Missing</th>
                  <th className="py-2.5 px-4 text-right">Completeness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredVariables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching variables found.
                    </td>
                  </tr>
                ) : (
                  filteredVariables.map((v) => {
                    const isHighMissing = v.missingPercentage > 30;
                    const isFullyComplete = v.missingCount === 0;

                    return (
                      <tr
                        key={v.key}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                          <span>{v.label}</span>
                          {v.required && (
                            <span className="text-[10px] text-teal-400 font-semibold px-1 rounded bg-teal-950/50 border border-teal-800/40">
                              Req
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-400 max-w-[150px] truncate">
                          {v.sectionTitle}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {v.inferredType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {v.validCount} / {v.totalRecords}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {v.missingCount > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                isHighMissing
                                  ? "bg-rose-950/50 text-rose-300 border border-rose-800/40"
                                  : "bg-amber-950/40 text-amber-300 border border-amber-800/30"
                              }`}
                            >
                              {v.missingCount} ({v.missingPercentage}%)
                            </span>
                          ) : (
                            <span className="text-emerald-400 inline-flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              0
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <span
                              className={`font-mono text-xs font-semibold ${
                                isFullyComplete
                                  ? "text-emerald-400"
                                  : isHighMissing
                                  ? "text-rose-400"
                                  : "text-slate-300"
                              }`}
                            >
                              {v.completionPercentage}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isFullyComplete
                                    ? "bg-emerald-400"
                                    : isHighMissing
                                    ? "bg-rose-500"
                                    : "bg-teal-500"
                                }`}
                                style={{ width: `${v.completionPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
