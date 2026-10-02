"use client";

import * as React from "react";
import {
  Printer,
  FileText,
  Download,
  X,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Info,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSchema, ResearchRecord } from "@/lib/supabase/types";
import {
  AnalyzedVariable,
  StudyAnalyticsOverview,
  AIResearchInsightsResult,
} from "./types";

interface ResearchReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studyTitle: string;
  researchObjective: string;
  overview: StudyAnalyticsOverview;
  variables: AnalyzedVariable[];
  insights: AIResearchInsightsResult | null;
  records: ResearchRecord[];
}

export function ResearchReportDialog({
  isOpen,
  onClose,
  studyTitle,
  researchObjective,
  overview,
  variables,
  insights,
  records,
}: ResearchReportDialogProps) {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const numericVariables = variables.filter((v) => v.inferredType === "numeric");
  const categoricalVariables = variables.filter(
    (v) =>
      v.inferredType === "categorical" ||
      v.inferredType === "boolean" ||
      (v.inferredType === "text" && v.categoricalStats && v.categoricalStats.frequencies.length > 0)
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Clinical Research Dataset Report"
      description="Print or save as PDF client-side."
      size="xl"
    >
      <div className="space-y-4">
        {/* Action Header in Dialog */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
          <span className="text-xs text-slate-400">
            Previewing generated study synthesis for {overview.totalRecords} records
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </Button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-lg print:shadow-none print:p-0 print:m-0 space-y-8 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible font-sans"
        >
          {/* 1. REPORT HEADER */}
          <div className="border-b-2 border-slate-900 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-lg tracking-tight">
                <span className="h-6 w-6 rounded bg-teal-700 text-white flex items-center justify-center text-xs">
                  CS
                </span>
                <span>ClinScope Research Platform</span>
              </div>
              <div className="text-right text-xs text-slate-500 font-mono">
                <div>Report Date: {currentDate}</div>
                <div>Status: Observational Dataset Summary</div>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                {studyTitle}
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <span className="font-semibold text-slate-800">Research Objective: </span>
                {researchObjective}
              </p>
            </div>
          </div>

          {/* 2. EXECUTIVE SUMMARY & COHORT METRICS */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-900 border-b border-slate-200 pb-1">
              1. Dataset Overview & Data Quality
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                  Total Records
                </div>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {overview.totalRecords}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                  Total Variables
                </div>
                <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                  {overview.totalVariables}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                  Overall Completeness
                </div>
                <div className="text-xl font-bold text-teal-700 font-mono mt-0.5">
                  {overview.overallCompletionRate}%
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">
                  Missing Cells
                </div>
                <div className="text-xl font-bold text-amber-700 font-mono mt-0.5">
                  {overview.totalMissingCells}
                </div>
              </div>
            </div>
          </div>

          {/* 3. AI RESEARCH INSIGHTS (IF AVAILABLE) */}
          {insights && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-900 border-b border-slate-200 pb-1">
                2. AI-Assisted Dataset Observations
              </h2>

              {insights.summary && (
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-lg text-xs leading-relaxed text-slate-800">
                  <span className="font-semibold text-teal-900 block mb-1">
                    Dataset Synthesis:
                  </span>
                  {insights.summary}
                </div>
              )}

              {insights.patterns && insights.patterns.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Observed Dataset Patterns:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insights.patterns.map((pat, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                      >
                        <div className="font-bold text-slate-900">{pat.title}</div>
                        <div className="text-slate-700 text-[11px] leading-relaxed">
                          {pat.description}
                        </div>
                        {pat.evidence && (
                          <div className="text-[10px] font-mono text-teal-800 font-semibold pt-1">
                            Evidence: {pat.evidence}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insights.potential_relationships &&
                insights.potential_relationships.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Potential Variable Relationships:
                    </h3>
                    <div className="space-y-2">
                      {insights.potential_relationships.map((rel, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                        >
                          <div className="font-bold text-slate-900">
                            {(rel.variables || []).join(" ↔ ")}
                          </div>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            {rel.observation}
                          </p>
                          {rel.evidence && (
                            <span className="text-[10px] font-mono text-slate-500">
                              Metric: {rel.evidence}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* 4. NUMERICAL VARIABLES STATISTICS TABLE */}
          {numericVariables.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-900 border-b border-slate-200 pb-1">
                3. Continuous Measurements Summary
              </h2>

              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Variable</th>
                    <th className="py-2 px-2 text-center">n</th>
                    <th className="py-2 px-2 text-center">Missing</th>
                    <th className="py-2 px-2 text-center">Mean (μ)</th>
                    <th className="py-2 px-2 text-center">Std Dev (σ)</th>
                    <th className="py-2 px-2 text-center">Median</th>
                    <th className="py-2 px-3 text-right">Min - Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                  {numericVariables.map((v) => (
                    <tr key={v.key}>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        {v.label}
                      </td>
                      <td className="py-2 px-2 text-center">{v.numericStats?.count || 0}</td>
                      <td className="py-2 px-2 text-center text-slate-500">
                        {v.numericStats?.missingCount || 0}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-teal-800">
                        {v.numericStats?.mean ?? "—"}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {v.numericStats?.stdDev ?? "—"}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {v.numericStats?.median ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-right">
                        [{v.numericStats?.min ?? 0} ... {v.numericStats?.max ?? 0}]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. CATEGORICAL DISTRIBUTIONS SUMMARY */}
          {categoricalVariables.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-900 border-b border-slate-200 pb-1">
                4. Discrete Factors & Frequencies
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoricalVariables.map((v) => (
                  <div
                    key={v.key}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2"
                  >
                    <div className="font-bold text-slate-900">{v.label}</div>
                    <div className="space-y-1">
                      {(v.categoricalStats?.frequencies || []).map((freq) => (
                        <div
                          key={freq.name}
                          className="flex items-center justify-between text-[11px] text-slate-700"
                        >
                          <span className="truncate max-w-[140px]">{freq.name}</span>
                          <span className="font-mono font-medium">
                            {freq.count} ({freq.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. SUGGESTED RESEARCH QUESTIONS */}
          {insights?.research_questions && insights.research_questions.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-teal-900 border-b border-slate-200 pb-1">
                5. Exploratory Research Questions
              </h2>
              <ol className="list-decimal list-inside text-xs text-slate-800 space-y-1 leading-relaxed">
                {insights.research_questions.map((rq, idx) => (
                  <li key={idx} className="font-medium">
                    {rq}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* 7. MANDATORY RESEARCH DISCLAIMER */}
          <div className="border-t-2 border-slate-300 pt-4 text-[10px] text-slate-500 leading-relaxed space-y-1">
            <span className="font-bold uppercase text-slate-700 block">
              Observational Dataset Disclaimer & Regulatory Notice
            </span>
            <p>
              This report describes patterns in the collected observational research dataset and does not constitute clinical conclusions, medical diagnosis, or treatment recommendations. All findings should be reviewed against original records and verified by the principal investigator.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
