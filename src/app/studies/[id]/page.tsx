"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
  Database,
  BrainCircuit,
  FileText,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
  Activity,
  CheckCircle2,
  FolderGit2,
  Share2,
  Info,
  Plus,
  Edit3,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { ResearchStudy, ResearchForm, ResearchRecord, FormSchema } from "@/lib/supabase/types";
import { GenerateFormModal } from "@/components/forms/generate-form-modal";
import { FormBuilder } from "@/components/forms/form-builder";
import { FormPreview } from "@/components/forms/form-preview";
import { RecordsManager } from "@/components/records/records-manager";
import { StudyAnalytics } from "@/components/analytics/study-analytics";

type StudyTab = "overview" | "form" | "data" | "insights";

export default function StudyWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);

  const studyId = params?.id as string;

  // Study Protocol State
  const [study, setStudy] = React.useState<ResearchStudy | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<StudyTab>("overview");

  // Form State
  const [formRecord, setFormRecord] = React.useState<ResearchForm | null>(null);
  const [currentSchema, setCurrentSchema] = React.useState<FormSchema | null>(null);
  const [formStatus, setFormStatus] = React.useState<"draft" | "published" | null>(null);
  const [isLoadingForm, setIsLoadingForm] = React.useState(true);
  const [isSavingForm, setIsSavingForm] = React.useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = React.useState(false);
  const [isEditingMode, setIsEditingMode] = React.useState(false);

  // Records State
  const [records, setRecords] = React.useState<ResearchRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = React.useState(true);

  // Fetch Study by ID
  const fetchStudy = React.useCallback(async () => {
    if (!studyId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("research_studies")
        .select("*")
        .eq("id", studyId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setStudy(data as ResearchStudy);
    } catch (err: any) {
      console.error("Error loading study:", err);
      setError(err?.message || "Failed to load research study details.");
    } finally {
      setIsLoading(false);
    }
  }, [studyId, supabase]);

  // Fetch Form for this Study
  const fetchForm = React.useCallback(async () => {
    if (!studyId) return;

    try {
      setIsLoadingForm(true);

      const { data, error: formError } = await supabase
        .from("research_forms")
        .select("*")
        .eq("study_id", studyId)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (data) {
        const rawRecord = data as any;
        const schema = (typeof rawRecord.schema === "string"
          ? JSON.parse(rawRecord.schema)
          : rawRecord.schema) as FormSchema;

        setFormRecord(rawRecord);
        setCurrentSchema(schema);
        setFormStatus(rawRecord.status === "published" ? "published" : "draft");
        setIsEditingMode(rawRecord.status !== "published");
      } else {
        // Fallback to localStorage for development resilience
        if (typeof window !== "undefined") {
          const localSaved = localStorage.getItem(`clinscope_form_${studyId}`);
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              setFormRecord(parsed);
              setCurrentSchema(parsed.schema);
              setFormStatus(parsed.status || "draft");
              setIsEditingMode(parsed.status !== "published");
            } catch {
              // ignore
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching form:", err);
      if (typeof window !== "undefined") {
        const localSaved = localStorage.getItem(`clinscope_form_${studyId}`);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            setFormRecord(parsed);
            setCurrentSchema(parsed.schema);
            setFormStatus(parsed.status || "draft");
            setIsEditingMode(parsed.status !== "published");
          } catch {
            // ignore
          }
        }
      }
    } finally {
      setIsLoadingForm(false);
    }
  }, [studyId, supabase]);

  // Fetch Records for this Study
  const fetchRecords = React.useCallback(async () => {
    if (!studyId) return;

    try {
      setIsLoadingRecords(true);

      const { data, error: recordsError } = await supabase
        .from("research_records")
        .select("*")
        .eq("study_id", studyId)
        .order("created_at", { ascending: false });

      if (recordsError) {
        console.warn("Supabase fetch records error, fallback to local:", recordsError);
        if (typeof window !== "undefined") {
          const local = localStorage.getItem(`clinscope_records_${studyId}`);
          if (local) {
            setRecords(JSON.parse(local));
          }
        }
      } else if (data) {
        setRecords(data as ResearchRecord[]);
        if (typeof window !== "undefined") {
          localStorage.setItem(`clinscope_records_${studyId}`, JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Error fetching records:", err);
      if (typeof window !== "undefined") {
        const local = localStorage.getItem(`clinscope_records_${studyId}`);
        if (local) {
          setRecords(JSON.parse(local));
        }
      }
    } finally {
      setIsLoadingRecords(false);
    }
  }, [studyId, supabase]);

  React.useEffect(() => {
    fetchStudy();
    fetchForm();
    fetchRecords();
  }, [fetchStudy, fetchForm, fetchRecords]);

  // Handle Form Generated via Gemini AI
  const handleFormGenerated = (schema: FormSchema) => {
    setCurrentSchema(schema);
    setFormStatus("draft");
    setIsEditingMode(true);
    setActiveTab("form");
  };

  // Save / Publish Form Handler
  const handleSaveForm = async (
    schemaToSave: FormSchema,
    targetStatus: "draft" | "published"
  ) => {
    if (!studyId) return;

    setIsSavingForm(true);

    try {
      const payload = {
        study_id: studyId,
        title: schemaToSave.title || study?.title || "Research Form",
        schema: schemaToSave as any,
        status: targetStatus,
        updated_at: new Date().toISOString(),
      };

      let savedRecord: any = null;

      try {
        if (formRecord?.id) {
          const { data, error: updateError } = await supabase
            .from("research_forms")
            .update(payload)
            .eq("id", formRecord.id)
            .select()
            .single();

          if (updateError) throw updateError;
          savedRecord = data;
        } else {
          const { data, error: insertError } = await supabase
            .from("research_forms")
            .insert(payload)
            .select()
            .single();

          if (insertError) throw insertError;
          savedRecord = data;
        }
      } catch (dbErr) {
        console.warn("Supabase research_forms table write skipped, syncing locally:", dbErr);
      }

      const finalRecord: ResearchForm = savedRecord || {
        id: formRecord?.id || `form_${Date.now()}`,
        study_id: studyId,
        title: payload.title,
        schema: schemaToSave,
        status: targetStatus,
        created_at: formRecord?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Persist to localStorage for client-side resilience
      if (typeof window !== "undefined") {
        localStorage.setItem(`clinscope_form_${studyId}`, JSON.stringify(finalRecord));
      }

      setFormRecord(finalRecord);
      setCurrentSchema(schemaToSave);
      setFormStatus(targetStatus);
      if (targetStatus === "published") {
        setIsEditingMode(false);
      }
    } finally {
      setIsSavingForm(false);
    }
  };

  // Save Record Handler (Create or Update)
  const handleSaveRecord = async (recordData: {
    id?: string;
    research_id: string;
    responses: Record<string, any>;
  }) => {
    if (!studyId) return;

    const payload = {
      study_id: studyId,
      research_id: recordData.research_id,
      responses: recordData.responses,
      updated_at: new Date().toISOString(),
    };

    let recordResult: ResearchRecord | null = null;

    try {
      if (recordData.id) {
        const { data, error } = await supabase
          .from("research_records")
          .update(payload)
          .eq("id", recordData.id)
          .select()
          .single();

        if (error) throw error;
        recordResult = data as ResearchRecord;
      } else {
        const { data, error } = await supabase
          .from("research_records")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        recordResult = data as ResearchRecord;
      }
    } catch (dbErr) {
      console.warn("Supabase research_records table write fallback:", dbErr);
      // Fallback local creation
      const localId = recordData.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      recordResult = {
        id: localId,
        study_id: studyId,
        research_id: recordData.research_id,
        responses: recordData.responses,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    await fetchRecords();
  };

  // Delete Record Handler
  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("research_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;
    } catch (dbErr) {
      console.warn("Supabase record delete fallback:", dbErr);
      if (typeof window !== "undefined") {
        const updated = records.filter((r) => r.id !== recordId);
        setRecords(updated);
        localStorage.setItem(`clinscope_records_${studyId}`, JSON.stringify(updated));
      }
    }

    await fetchRecords();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse pb-12">
        <div className="h-6 bg-slate-800/60 rounded w-48" />
        <div className="h-10 bg-slate-800 rounded w-3/4" />
        <div className="h-24 bg-slate-800/40 rounded-xl" />
        <div className="h-12 bg-slate-800/50 rounded-xl w-96" />
        <div className="h-64 bg-slate-800/30 rounded-xl" />
      </div>
    );
  }

  if (error || !study) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-rose-950/50 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Study Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {error || "The requested clinical research study could not be retrieved from Supabase."}
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(study.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Derived last record added timestamp (no hook, safe non-mutating sort)
  const latestRecord =
    records && records.length > 0
      ? [...records].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : null;

  const lastRecordAdded = latestRecord
    ? new Date(latestRecord.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  // Derived check for cached AI insights (no hook)
  const hasCachedAIInsights =
    typeof window !== "undefined" && studyId
      ? Boolean(localStorage.getItem(`clinscope_ai_insights_${studyId}`))
      : false;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link
          href="/dashboard"
          className="hover:text-teal-400 transition-colors flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-500">Studies</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-300 truncate max-w-xs">{study.title}</span>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0f1523] p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  formStatus === "published"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                    : "bg-amber-950/60 text-amber-300 border-amber-800/60"
                }`}
              >
                {formStatus === "published" ? "Published Protocol" : "Draft Protocol"}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created on {formattedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {study.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {study.research_objective}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator?.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Study workspace link copied to clipboard.");
                }
              }}
              className="text-xs gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Protocol</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-800/80 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all shrink-0 ${
            activeTab === "overview"
              ? "border-teal-500 text-teal-400 bg-teal-950/10 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("form")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all shrink-0 ${
            activeTab === "form"
              ? "border-teal-500 text-teal-400 bg-teal-950/10 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Form</span>
          {formStatus === "published" && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 ml-0.5" />
          )}
          {formStatus === "draft" && (
            <span className="h-2 w-2 rounded-full bg-amber-400 ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all shrink-0 ${
            activeTab === "data"
              ? "border-teal-500 text-teal-400 bg-teal-950/10 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data</span>
          <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-teal-400 font-semibold ml-0.5">
            {records.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all shrink-0 ${
            activeTab === "insights"
              ? "border-teal-500 text-teal-400 bg-teal-950/10 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Insights</span>
        </button>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-1">
              <CardHeader className="p-4 space-y-1">
                <span className="text-xs text-slate-400">Total Patient Records</span>
                <div className="text-2xl font-bold text-white">
                  {isLoadingRecords ? "..." : records.length}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {lastRecordAdded ? `Latest: ${lastRecordAdded}` : "No records yet"}
                </div>
              </CardHeader>
            </Card>

            <Card className="p-1">
              <CardHeader className="p-4 space-y-1">
                <span className="text-xs text-slate-400">Form Schema Status</span>
                <div className="text-sm font-semibold mt-1">
                  {formStatus === "published" ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Published Protocol
                    </span>
                  ) : formStatus === "draft" ? (
                    <span className="text-amber-400">Draft (In Design)</span>
                  ) : (
                    <span className="text-slate-500">Pending Generation</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {currentSchema
                    ? `${currentSchema.sections?.reduce(
                        (acc, s) => acc + (s.fields?.length || 0),
                        0
                      )} variables configured`
                    : "No fields configured"}
                </div>
              </CardHeader>
            </Card>

            <Card
              onClick={() => setActiveTab("insights")}
              className="p-1 cursor-pointer hover:border-teal-500/40 transition-colors group"
            >
              <CardHeader className="p-4 space-y-1">
                <span className="text-xs text-slate-400 group-hover:text-teal-400 transition-colors">
                  AI Research Insights
                </span>
                <div className="text-sm font-semibold mt-1">
                  {hasCachedAIInsights ? (
                    <span className="text-teal-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      Insights Generated
                    </span>
                  ) : records.length > 0 ? (
                    <span className="text-cyan-400 flex items-center gap-1.5">
                      <BrainCircuit className="w-4 h-4" />
                      Ready to Analyze
                    </span>
                  ) : (
                    <span className="text-slate-500">Awaiting Data</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {records.length > 0
                    ? `${records.length} records available`
                    : "Collect data first"}
                </div>
              </CardHeader>
            </Card>

            <Card className="p-1">
              <CardHeader className="p-4 space-y-1">
                <span className="text-xs text-slate-400">Study Created</span>
                <div className="text-sm font-bold text-slate-200 mt-1">
                  {formattedDate}
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate">
                  ID: {study.id.substring(0, 8)}...
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Protocol Details Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Study Protocol Details</CardTitle>
                <CardDescription>
                  Core research objectives and structural metadata registered in Supabase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#0b101d] border border-slate-800/80 space-y-2">
                  <span className="font-semibold text-slate-300 block">Research Objective</span>
                  <p className="text-slate-400 leading-relaxed">
                    {study.research_objective}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#0b101d]/60 border border-slate-800/60">
                    <span className="text-slate-500 block mb-1">Study Protocol ID</span>
                    <span className="font-mono text-slate-300 select-all">{study.id}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0b101d]/60 border border-slate-800/60">
                    <span className="text-slate-500 block mb-1">Protocol Status</span>
                    <span className="text-amber-400 font-medium">
                      {formStatus === "published" ? "Published & Active" : "Draft Design"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>
                  Workflow to collect and analyze research data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div
                  onClick={() => setActiveTab("form")}
                  className="p-3 rounded-lg border border-slate-800 bg-[#0b101d] hover:border-teal-500/40 hover:bg-teal-950/10 transition-colors cursor-pointer group flex items-start gap-3"
                >
                  <div className="h-6 w-6 rounded-md bg-teal-950/80 text-teal-400 border border-teal-800/40 flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-white group-hover:text-teal-400 transition-colors">
                      {formStatus === "published"
                        ? "Protocol Form Published"
                        : currentSchema
                        ? "Review & Publish Form"
                        : "Generate Research Form with AI"}
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {currentSchema
                        ? `${currentSchema.sections?.length || 0} sections configured.`
                        : "Define clinical observation inputs and fields for this protocol."}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("data")}
                  className="p-3 rounded-lg border border-slate-800 bg-[#0b101d] hover:border-teal-500/40 hover:bg-teal-950/10 transition-colors cursor-pointer group flex items-start gap-3"
                >
                  <div className="h-6 w-6 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-white group-hover:text-teal-400 transition-colors">
                      Collect Clinical Data
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {records.length > 0
                        ? `${records.length} patient records recorded.`
                        : "Record observational records and patient responses."}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("insights")}
                  className="p-3 rounded-lg border border-slate-800 bg-[#0b101d] hover:border-teal-500/40 hover:bg-teal-950/10 transition-colors cursor-pointer group flex items-start gap-3"
                >
                  <div className="h-6 w-6 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-white group-hover:text-teal-400 transition-colors">
                      Generate AI Insights
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Extract summaries, statistical distributions, and correlations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. FORM TAB */}
      {activeTab === "form" && (
        <div className="space-y-6">
          {isLoadingForm ? (
            <div className="p-12 text-center rounded-xl border border-slate-800 bg-[#0f1523]/40 animate-pulse">
              <p className="text-xs text-slate-400">Loading form configuration...</p>
            </div>
          ) : !currentSchema ? (
            /* Empty State -> Prompt to Generate */
            <Card className="p-12 text-center border-dashed border-slate-800 bg-[#0f1523]/50">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-950/60 border border-teal-800/40 text-teal-400 flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-white">
                    Generate Research Form with AI
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Leverage Gemini to design clinical observation fields, baseline vitals, and laboratory biomarkers tailored to your protocol.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Research Form with AI</span>
                  </Button>
                </div>
              </div>
            </Card>
          ) : formStatus === "published" && !isEditingMode ? (
            /* Published View -> Clean Preview with Edit Option */
            <FormPreview
              schema={currentSchema}
              status="published"
              onEdit={() => setIsEditingMode(true)}
              interactive
            />
          ) : (
            /* Draft / Editing Mode -> Full FormBuilder */
            <FormBuilder
              initialSchema={currentSchema}
              status={formStatus || "draft"}
              onSave={handleSaveForm}
              isSaving={isSavingForm}
              onRegenerate={() => setIsGenerateModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* 3. DATA TAB */}
      {activeTab === "data" && (
        <div className="space-y-6">
          {formStatus !== "published" || !currentSchema ? (
            /* Published Form Required Notice */
            <Card className="p-12 text-center border-dashed border-slate-800 bg-[#0f1523]/50">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-white">
                    No published research form yet.
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generate and publish a form before collecting records.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => setActiveTab("form")}
                    className="gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium"
                  >
                    <span>Go to Form Tab</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            /* Full Dynamic Records Manager */
            <RecordsManager
              studyId={studyId}
              schema={currentSchema}
              records={records}
              isLoading={isLoadingRecords}
              onSaveRecord={handleSaveRecord}
              onDeleteRecord={handleDeleteRecord}
            />
          )}
        </div>
      )}

      {/* 4. INSIGHTS TAB */}
      {activeTab === "insights" && (
        <StudyAnalytics
          studyId={studyId}
          studyTitle={study?.title}
          researchObjective={study?.research_objective}
          schema={currentSchema}
          records={records}
          onNavigateToDataTab={() => setActiveTab("data")}
        />
      )}

      {/* GENERATE FORM MODAL */}
      <GenerateFormModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        studyTitle={study.title}
        defaultObjective={study.research_objective}
        onGenerated={handleFormGenerated}
      />
    </div>
  );
}
