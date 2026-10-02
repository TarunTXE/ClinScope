"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Hash,
  Layers,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Activity,
  Calendar,
  Database
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StudyAnalyticsOverview } from "./types";

interface OverviewCardsProps {
  overview: StudyAnalyticsOverview;
}

export function OverviewCards({ overview }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Records */}
      <Card className="bg-[#0f1523]/80 border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors" />
        <CardContent className="p-4 space-y-1 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Total Records</span>
            <div className="h-7 w-7 rounded-lg bg-teal-950/70 border border-teal-800/40 text-teal-400 flex items-center justify-center">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {overview.totalRecords}
          </div>
          <p className="text-[10px] text-slate-500">Collected patient observations</p>
        </CardContent>
      </Card>

      {/* 2. Total Variables */}
      <Card className="bg-[#0f1523]/80 border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
        <CardContent className="p-4 space-y-1 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Total Variables</span>
            <div className="h-7 w-7 rounded-lg bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {overview.totalVariables}
          </div>
          <p className="text-[10px] text-slate-500">Configured protocol fields</p>
        </CardContent>
      </Card>

      {/* 3. Missing Values */}
      <Card className="bg-[#0f1523]/80 border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
        <CardContent className="p-4 space-y-1 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Missing Values</span>
            <div className="h-7 w-7 rounded-lg bg-amber-950/70 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">
              {overview.totalMissingCells}
            </span>
            <span className="text-[11px] text-slate-400">
              ({overview.totalPossibleCells > 0
                ? ((overview.totalMissingCells / overview.totalPossibleCells) * 100).toFixed(1)
                : 0}
              %)
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Across {overview.totalPossibleCells} data points</p>
        </CardContent>
      </Card>

      {/* 4. Numeric Variables */}
      <Card className="bg-[#0f1523]/80 border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
        <CardContent className="p-4 space-y-1 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Numeric Variables</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-950/70 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
              <Hash className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {overview.numericVariablesCount}
          </div>
          <p className="text-[10px] text-slate-500">Continuous measurements</p>
        </CardContent>
      </Card>

      {/* 5. Categorical Variables */}
      <Card className="col-span-2 lg:col-span-1 bg-[#0f1523]/80 border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700/80 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
        <CardContent className="p-4 space-y-1 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Categorical Variables</span>
            <div className="h-7 w-7 rounded-lg bg-violet-950/70 border border-violet-800/40 text-violet-400 flex items-center justify-center">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {overview.categoricalVariablesCount}
          </div>
          <p className="text-[10px] text-slate-500">Select, radio & boolean factors</p>
        </CardContent>
      </Card>
    </div>
  );
}
