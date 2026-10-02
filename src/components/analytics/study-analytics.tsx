"use client";

import * as React from "react";
import {
  BrainCircuit,
  Database,
  Layers,
  Hash,
  PieChart,
  ShieldCheck,
  GitCompare,
  ArrowRight,
  Filter,
  Search,
  AlertCircle,
  Info,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Printer,
  FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSchema, ResearchRecord } from "@/lib/supabase/types";
import { analyzeDataset } from "./analytics-utils";
import { OverviewCards } from "./overview-cards";
import { DataQualitySection } from "./data-quality-section";
import { NumericAnalyticsCard } from "./numeric-analytics-card";
import { CategoricalAnalyticsCard } from "./categorical-analytics-card";
import { CompareVariablesSection } from "./compare-variables-section";
import { AIInsightsSection } from "./ai-insights-section";
import { ResearchReportDialog } from "./research-report-dialog";
import { AIResearchInsightsResult } from "./types";

interface StudyAnalyticsProps {
  studyId: string;
  studyTitle?: string;
  researchObjective?: string;
  schema: FormSchema | null;
  records: ResearchRecord[];
  onNavigateToDataTab?: () => void;
}

type AnalyticsSubTab = "ai" | "all" | "numeric" | "categorical" | "quality" | "compare";

export function StudyAnalytics({
  studyId,
  studyTitle = "Clinical Research Protocol",
  researchObjective = "Observational data collection",
  schema,
  records,
  onNavigateToDataTab,
}: StudyAnalyticsProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<AnalyticsSubTab>("ai");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [cachedInsights, setCachedInsights] = React.useState<AIResearchInsightsResult | null>(null);

  // Load any cached insights for the report
  React.useEffect(() => {
    if (typeof window !== "undefined" && studyId) {
      const saved = localStorage.getItem(`clinscope_ai_insights_${studyId}`);
      if (saved) {
        try {
          setCachedInsights(JSON.parse(saved));
        } catch {}
      }
    }
  }, [studyId]);

  // Run pure dataset analytics on records and schema
  const { overview, variables } = React.useMemo(() => {
    return analyzeDataset(schema, records);
  }, [schema, records]);

  // Handle Empty State when no records exist
  if (!records || records.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-slate-800 bg-[#0f1523]/50">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-teal-950/70 border border-teal-800/40 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Collect research records before generating AI insights.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once clinical observational records are recorded, automated statistical distributions, categorical frequencies, missingness matrices, and AI research synthesis will generate instantly.
            </p>
          </div>
          {onNavigateToDataTab && (
            <div className="pt-2">
              <Button
                onClick={onNavigateToDataTab}
                className="gap-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-4 py-2"
              >
                <span>Go to Data Tab</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Handle Missing Schema State
  if (!schema || !schema.sections || schema.sections.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-slate-800 bg-[#0f1523]/50">
        <div className="max-w-md mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">
            Form schema not detected
          </h3>
          <p className="text-xs text-slate-400">
            Publish a protocol form to structure research variables for analytics.
          </p>
        </div>
      </Card>
    );
  }

  const numericVariables = variables.filter((v) => v.inferredType === "numeric");
  const categoricalVariables = variables.filter(
    (v) =>
      v.inferredType === "categorical" ||
      v.inferredType === "boolean" ||
      (v.inferredType === "text" && v.categoricalStats && v.categoricalStats.frequencies.length > 0)
  );

  const filteredNumeric = numericVariables.filter((v) =>
    v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategorical = categoricalVariables.filter((v) =>
    v.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. TOP METRIC STATS OVERVIEW */}
      <OverviewCards overview={overview} />

      {/* 2. SUB-NAVIGATION & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab("ai")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeSubTab === "ai"
                ? "bg-gradient-to-r from-teal-950/90 to-cyan-950/80 text-teal-300 border border-teal-700/60 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Insights</span>
          </button>

          <button
            onClick={() => setActiveSubTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
              activeSubTab === "all"
                ? "bg-teal-950/70 text-teal-300 border border-teal-800/50 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            All Charts ({variables.length})
          </button>

          <button
            onClick={() => setActiveSubTab("numeric")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeSubTab === "numeric"
                ? "bg-teal-950/70 text-teal-300 border border-teal-800/50 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <Hash className="w-3 h-3" />
            <span>Numeric ({numericVariables.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("categorical")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeSubTab === "categorical"
                ? "bg-teal-950/70 text-teal-300 border border-teal-800/50 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <PieChart className="w-3 h-3" />
            <span>Categorical ({categoricalVariables.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("quality")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeSubTab === "quality"
                ? "bg-teal-950/70 text-teal-300 border border-teal-800/50 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Data Quality</span>
          </button>

          <button
            onClick={() => setActiveSubTab("compare")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeSubTab === "compare"
                ? "bg-teal-950/70 text-teal-300 border border-teal-800/50 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`}
          >
            <GitCompare className="w-3 h-3" />
            <span>Compare Variables</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {(activeSubTab === "all" || activeSubTab === "numeric" || activeSubTab === "categorical") && (
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter variables..."
                className="pl-8 text-xs h-8 bg-[#0b101d] border-slate-800"
              />
            </div>
          )}

          <Button
            onClick={() => setIsReportOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-teal-300 border-teal-800/60 bg-teal-950/40 hover:bg-teal-900/60 shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Research Report</span>
          </Button>
        </div>
      </div>

      {/* 3. SUBTAB CONTENTS */}

      {/* AI RESEARCH INSIGHTS SECTION */}
      {activeSubTab === "ai" && (
        <AIInsightsSection
          studyId={studyId}
          studyTitle={studyTitle}
          researchObjective={researchObjective}
          overview={overview}
          variables={variables}
          schema={schema}
          records={records}
        />
      )}

      {/* ALL OR NUMERIC SECTION */}
      {(activeSubTab === "all" || activeSubTab === "numeric") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-teal-950/80 text-teal-400 flex items-center justify-center text-xs font-bold">
                #
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Numeric Variables Analytics ({filteredNumeric.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Continuous metrics & frequency distributions
            </span>
          </div>

          {filteredNumeric.length === 0 ? (
            <Card className="p-8 text-center bg-[#0f1523]/40 border-slate-800">
              <p className="text-xs text-slate-400">
                {numericVariables.length === 0
                  ? "No numeric variables found in this research protocol."
                  : "No numeric variables match your search filter."}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredNumeric.map((v) => (
                <NumericAnalyticsCard key={v.key} variable={v} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ALL OR CATEGORICAL SECTION */}
      {(activeSubTab === "all" || activeSubTab === "categorical") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-violet-950/80 text-violet-400 flex items-center justify-center text-xs font-bold">
                %
              </div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Categorical & Discrete Analytics ({filteredCategorical.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Frequencies, proportions & categorical distributions
            </span>
          </div>

          {filteredCategorical.length === 0 ? (
            <Card className="p-8 text-center bg-[#0f1523]/40 border-slate-800">
              <p className="text-xs text-slate-400">
                {categoricalVariables.length === 0
                  ? "No categorical variables found in this research protocol."
                  : "No categorical variables match your search filter."}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCategorical.map((v) => (
                <CategoricalAnalyticsCard key={v.key} variable={v} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* DATA QUALITY SECTION */}
      {(activeSubTab === "all" || activeSubTab === "quality") && (
        <div className="pt-2">
          <DataQualitySection overview={overview} variables={variables} />
        </div>
      )}

      {/* COMPARE VARIABLES SECTION */}
      {(activeSubTab === "all" || activeSubTab === "compare") && (
        <div className="pt-2">
          <CompareVariablesSection
            schema={schema}
            records={records}
            variables={variables}
          />
        </div>
      )}

      {/* 4. MANDATORY DISCLAIMER NOTICE (FOR CHARTS VIEW) */}
      {activeSubTab !== "ai" && (
        <div className="p-4 rounded-xl bg-[#0b101d]/90 border border-slate-800/80 flex items-start gap-3">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300 block mb-0.5">
              Observational Dataset Disclaimer
            </span>
            Analytics describe patterns in the collected dataset and do not constitute clinical conclusions.
          </div>
        </div>
      )}

      {/* RESEARCH REPORT PRINTABLE MODAL */}
      <ResearchReportDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        studyTitle={studyTitle}
        researchObjective={researchObjective}
        overview={overview}
        variables={variables}
        insights={cachedInsights}
        records={records}
      />
    </div>
  );
}
