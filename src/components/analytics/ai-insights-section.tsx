"use client";

import * as React from "react";
import {
  Sparkles,
  BrainCircuit,
  Lightbulb,
  ShieldAlert,
  GitFork,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  Copy,
  Check,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormSchema, ResearchRecord } from "@/lib/supabase/types";
import {
  AIResearchInsightsResult,
  StudyAnalyticsOverview,
  AnalyzedVariable,
} from "./types";
import { buildAggregatedDatasetSummary } from "./analytics-utils";

interface AIInsightsSectionProps {
  studyId: string;
  studyTitle: string;
  researchObjective: string;
  overview: StudyAnalyticsOverview;
  variables: AnalyzedVariable[];
  schema: FormSchema;
  records: ResearchRecord[];
}

const SAMPLE_QUESTIONS = [
  "Which variables have the most missing data?",
  "What are the key numeric distributions observed in this dataset?",
  "What notable groupings appear across categorical factors?",
  "Are there any extreme values or potential outliers?",
];

export function AIInsightsSection({
  studyId,
  studyTitle,
  researchObjective,
  overview,
  variables,
  schema,
  records,
}: AIInsightsSectionProps) {
  const [insights, setInsights] = React.useState<AIResearchInsightsResult | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Natural Language Q&A State
  const [questionInput, setQuestionInput] = React.useState("");
  const [isAsking, setIsAsking] = React.useState(false);
  const [qaHistory, setQaHistory] = React.useState<
    Array<{ question: string; answer: string; timestamp: string }>
  >([]);
  const [qaError, setQaError] = React.useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  // Load cached insights from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined" && studyId) {
      const saved = localStorage.getItem(`clinscope_ai_insights_${studyId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setInsights(parsed);
        } catch {
          // ignore
        }
      }

      const savedQA = localStorage.getItem(`clinscope_ai_qa_${studyId}`);
      if (savedQA) {
        try {
          const parsedQA = JSON.parse(savedQA);
          if (Array.isArray(parsedQA)) setQaHistory(parsedQA);
        } catch {
          // ignore
        }
      }
    }
  }, [studyId]);

  // Handle Generate / Regenerate AI Insights
  const handleGenerateInsights = async () => {
    if (!records || records.length === 0) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      // 1. Build strictly aggregated dataset summary (No PII / raw rows)
      const aggregatedSummary = buildAggregatedDatasetSummary(
        studyTitle,
        researchObjective,
        overview,
        variables,
        schema,
        records
      );

      // 2. Call server-side API
      const response = await fetch("/api/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetSummary: aggregatedSummary }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate AI insights.");
      }

      const generatedInsights: AIResearchInsightsResult = result.insights;
      setInsights(generatedInsights);

      // Persist in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `clinscope_ai_insights_${studyId}`,
          JSON.stringify(generatedInsights)
        );
      }
    } catch (err: any) {
      console.error("AI Insights Error:", err);
      setErrorMessage(
        err?.message || "An unexpected error occurred while analyzing the dataset."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Natural Language Question Submission
  const handleAskQuestion = async (qText?: string) => {
    const query = (qText || questionInput).trim();
    if (!query || isAsking || !records || records.length === 0) return;

    setIsAsking(true);
    setQaError(null);

    try {
      const aggregatedSummary = buildAggregatedDatasetSummary(
        studyTitle,
        researchObjective,
        overview,
        variables,
        schema,
        records
      );

      const response = await fetch("/api/ask-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetSummary: aggregatedSummary,
          question: query,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to retrieve answer from AI.");
      }

      const newEntry = {
        question: query,
        answer: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const updatedHistory = [newEntry, ...qaHistory.slice(0, 9)];
      setQaHistory(updatedHistory);
      setQuestionInput("");

      if (typeof window !== "undefined") {
        localStorage.setItem(
          `clinscope_ai_insights_qa_${studyId}`,
          JSON.stringify(updatedHistory)
        );
      }
    } catch (err: any) {
      console.error("Ask Dataset Error:", err);
      setQaError(err?.message || "Failed to answer dataset inquiry.");
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyAnswer = (text: string, index: number) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const hasRecords = records && records.length > 0;

  return (
    <div className="space-y-6">
      {/* 1. HEADER & ACTION BANNER */}
      <Card className="bg-[#0f1523] border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800/50 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  AI Research Insights
                </h2>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Automated statistical synthesis evaluating observational patterns, cross-variable associations, and exploratory research hypotheses directly from the collected dataset.
              </p>
              {insights?.generated_at && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>
                    Last analyzed:{" "}
                    {new Date(insights.generated_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="shrink-0">
              {!hasRecords ? (
                <div className="text-xs text-amber-400 bg-amber-950/30 border border-amber-800/40 px-3.5 py-2 rounded-xl">
                  Collect research records before generating AI insights.
                </div>
              ) : (
                <Button
                  onClick={handleGenerateInsights}
                  disabled={isGenerating}
                  className="gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-medium text-xs shadow-md"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Dataset Statistics...</span>
                    </>
                  ) : insights ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate Insights</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate AI Research Insights</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="space-y-1">
            <span className="font-semibold block">Generation Failed</span>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE SKELETON */}
      {isGenerating && (
        <div className="space-y-5 animate-pulse">
          <Card className="bg-[#0f1523]/60 border-slate-800 p-6 space-y-3">
            <div className="h-4 bg-slate-800 rounded w-40" />
            <div className="h-16 bg-slate-800/50 rounded-xl" />
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-slate-800/40 rounded-xl border border-slate-800" />
            <div className="h-40 bg-slate-800/40 rounded-xl border border-slate-800" />
          </div>
        </div>
      )}

      {/* 3. INSIGHTS RESULTS DISPLAY */}
      {insights && !isGenerating && (
        <div className="space-y-6">
          {/* SECTION A: DATASET SUMMARY */}
          <Card className="bg-[#0f1523] border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-800/80 bg-[#0f1523]/90">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/40 flex items-center justify-center">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
                <CardTitle className="text-sm sm:text-base font-semibold text-white">
                  Dataset Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {insights.summary}
              </p>
            </CardContent>
          </Card>

          {/* SECTION B: OBSERVED PATTERNS */}
          {insights.patterns && insights.patterns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-teal-950/80 text-teal-400 flex items-center justify-center text-xs font-bold">
                  ★
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Observed Dataset Patterns ({insights.patterns.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.patterns.map((pat, idx) => (
                  <Card
                    key={idx}
                    className="bg-[#0f1523] border-slate-800 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between"
                  >
                    <CardContent className="p-4 sm:p-5 space-y-2.5">
                      <div className="space-y-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          {pat.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {pat.description}
                        </p>
                      </div>

                      {pat.evidence && (
                        <div className="pt-2 border-t border-slate-800/60">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-teal-950/50 text-teal-300 border border-teal-800/40">
                            <span className="text-teal-400 font-semibold">Evidence:</span>{" "}
                            {pat.evidence}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION C: POTENTIAL RELATIONSHIPS */}
          {insights.potential_relationships &&
            insights.potential_relationships.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-indigo-950/80 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    ⇋
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Potential Variable Relationships (
                    {insights.potential_relationships.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {insights.potential_relationships.map((rel, idx) => (
                    <Card
                      key={idx}
                      className="bg-[#0f1523] border-slate-800 shadow-sm p-4 sm:p-5 hover:border-slate-700/80 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {(rel.variables || []).map((vName, vIdx) => (
                            <React.Fragment key={vIdx}>
                              <span className="text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-md bg-[#0b101d] text-slate-200 border border-slate-700">
                                {vName}
                              </span>
                              {vIdx < (rel.variables || []).length - 1 && (
                                <span className="text-slate-500 text-xs">↔</span>
                              )}
                            </React.Fragment>
                          ))}
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 ml-auto">
                            Observed Association
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {rel.observation}
                        </p>

                        {rel.evidence && (
                          <div className="pt-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-[#0b101d] text-slate-400 border border-slate-800">
                              <span className="text-slate-300 font-medium">Metric:</span>{" "}
                              {rel.evidence}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          {/* SECTION D: DATA QUALITY & OUTLIERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* DATA QUALITY OBSERVATIONS */}
            {insights.data_quality && insights.data_quality.length > 0 && (
              <Card className="bg-[#0f1523] border-slate-800 shadow-sm">
                <CardHeader className="p-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <CardTitle className="text-xs sm:text-sm font-semibold text-white">
                      Data Quality & Missingness
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {insights.data_quality.map((dq, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#0b101d]/70 border border-slate-800/70 space-y-1"
                    >
                      <h5 className="text-xs font-semibold text-amber-300">
                        {dq.issue}
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {dq.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* POTENTIAL OUTLIERS / EXTREMES */}
            {insights.outliers && insights.outliers.length > 0 && (
              <Card className="bg-[#0f1523] border-slate-800 shadow-sm">
                <CardHeader className="p-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <CardTitle className="text-xs sm:text-sm font-semibold text-white">
                      Distribution Extremes & Outliers
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {insights.outliers.map((outlier, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#0b101d]/70 border border-slate-800/70 space-y-1"
                    >
                      <span className="text-[11px] font-mono font-semibold text-rose-300 block">
                        {outlier.variable}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {outlier.observation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* SECTION E: RESEARCH QUESTIONS */}
          {insights.research_questions && insights.research_questions.length > 0 && (
            <Card className="bg-[#0f1523] border-slate-800 shadow-sm">
              <CardHeader className="p-5 border-b border-slate-800/80 bg-[#0f1523]/90">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-semibold text-white">
                      Suggested Research Inquiries
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Exploratory questions prompted by observed dataset distributions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {insights.research_questions.map((rq, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0b101d] border border-slate-800/80 flex items-start gap-3"
                  >
                    <div className="h-5 w-5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      {rq}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 4. NATURAL LANGUAGE DATASET QUESTIONS ("Ask about this dataset") */}
      {hasRecords && (
        <Card className="bg-[#0f1523] border-slate-800 shadow-sm">
          <CardHeader className="p-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-teal-950/80 text-teal-400 border border-teal-800/40 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-white">
                  Ask About This Dataset
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Query aggregated statistics and distributions in natural clinical language
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            {/* Suggested Question Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 font-medium block">
                Suggested questions:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestionInput(q);
                      handleAskQuestion(q);
                    }}
                    disabled={isAsking}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0b101d] hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Submit Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="e.g. Which variables have the highest standard deviation or missing data?"
                  disabled={isAsking}
                  className="pl-8 text-xs h-9 bg-[#0b101d] border-slate-800 text-slate-200 placeholder:text-slate-500 focus:border-teal-500"
                />
              </div>
              <Button
                type="submit"
                disabled={isAsking || !questionInput.trim()}
                className="gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs h-9 px-4 shrink-0"
              >
                {isAsking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </>
                )}
              </Button>
            </form>

            {qaError && (
              <p className="text-xs text-rose-400 bg-rose-950/20 border border-rose-800/30 p-2 rounded-lg">
                {qaError}
              </p>
            )}

            {/* Q&A Responses Stream */}
            {qaHistory.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Recent Inquiries:
                </span>
                {qaHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0b101d] border border-slate-800/80 space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0" />
                        <span className="text-xs font-semibold text-white">
                          {item.question}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.timestamp}
                        </span>
                        <button
                          onClick={() => handleCopyAnswer(item.answer, idx)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Copy answer"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pl-3.5 border-l-2 border-slate-800">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. MANDATORY RESEARCH DISCLAIMER */}
      <div className="p-4 rounded-xl bg-[#0b101d]/90 border border-slate-800/80 flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-300 block mb-0.5">
            AI-assisted dataset observations — not clinical conclusions.
          </span>
          Review all findings against the underlying data before using them for research.
        </div>
      </div>
    </div>
  );
}
