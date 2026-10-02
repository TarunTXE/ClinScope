"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  Plus,
  FileSpreadsheet,
  BrainCircuit,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { ResearchStudy } from "@/lib/supabase/types";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuth();
  const supabase = React.useMemo(() => createClient(), []);

  // Study List State
  const [studies, setStudies] = React.useState<ResearchStudy[]>([]);
  const [totalRecordsCount, setTotalRecordsCount] = React.useState<number>(0);
  const [isLoadingStudies, setIsLoadingStudies] = React.useState(true);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);

  // Create Study Form State
  const [studyTitle, setStudyTitle] = React.useState("");
  const [researchObjective, setResearchObjective] = React.useState("");
  const [researchDomain, setResearchDomain] = React.useState("");
  const [isCreatingStudy, setIsCreatingStudy] = React.useState(false);
  const [createStudyError, setCreateStudyError] = React.useState<string | null>(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = React.useState({
    fullName: "",
    specialization: "",
    institution: "",
  });
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch real research studies and actual record counts for the authenticated doctor
  const fetchStudies = React.useCallback(async () => {
    if (!user) return;
    try {
      setIsLoadingStudies(true);
      const { data: studiesData, error: studiesError } = await supabase
        .from("research_studies")
        .select("*")
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (studiesError) {
        console.error("Error loading research studies:", studiesError);
        return;
      }

      const rawStudies = (studiesData as ResearchStudy[]) || [];
      const studyIds = rawStudies.map((s) => s.id);
      let totalRecs = 0;
      const countMap: Record<string, number> = {};

      if (studyIds.length > 0) {
        try {
          const { data: recordsData } = await supabase
            .from("research_records")
            .select("id, study_id");

          if (recordsData) {
            recordsData.forEach((rec: any) => {
              if (studyIds.includes(rec.study_id)) {
                totalRecs += 1;
                countMap[rec.study_id] = (countMap[rec.study_id] || 0) + 1;
              }
            });
          }
        } catch (recErr) {
          console.warn("Records count fetch error:", recErr);
        }
      }

      setTotalRecordsCount(totalRecs);
      setStudies(
        rawStudies.map((s) => ({
          ...s,
          records_count: countMap[s.id] || 0,
        }))
      );
    } catch (err) {
      console.error("Error fetching studies:", err);
    } finally {
      setIsLoadingStudies(false);
    }
  }, [user, supabase]);

  React.useEffect(() => {
    if (user) {
      fetchStudies();
    }
  }, [user, fetchStudies]);

  // Sync profile data to form
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.full_name || "",
        specialization: profile.specialization || "",
        institution: profile.institution || "",
      });
    }
  }, [profile, isEditProfileOpen]);

  // Formatted greeting
  const rawName = profile?.full_name || user?.user_metadata?.full_name || "";
  const doctorGreeting = rawName
    ? rawName.startsWith("Dr.") || rawName.startsWith("dr.")
      ? rawName
      : `Dr. ${rawName}`
    : "Doctor";

  // Create Study Handler
  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateStudyError(null);

    if (!user) {
      setCreateStudyError("Authentication required. Please sign in again.");
      return;
    }

    if (!studyTitle.trim()) {
      setCreateStudyError("Study Title is required.");
      return;
    }

    if (!researchObjective.trim()) {
      setCreateStudyError("Research Objective is required.");
      return;
    }

    setIsCreatingStudy(true);

    try {
      const { data, error } = await supabase
        .from("research_studies")
        .insert({
          doctor_id: user.id,
          title: studyTitle.trim(),
          research_objective: researchObjective.trim(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setIsCreateModalOpen(false);
      setStudyTitle("");
      setResearchObjective("");
      setResearchDomain("");
      await fetchStudies();

      if (data?.id) {
        router.push(`/studies/${data.id}`);
      }
    } catch (err: any) {
      console.error("Error creating study:", err);
      setCreateStudyError(err.message || "Failed to create research study. Please try again.");
    } finally {
      setIsCreatingStudy(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!profileForm.fullName.trim()) {
      setProfileMessage({ type: "error", text: "Full name is required." });
      return;
    }

    setIsSavingProfile(true);

    try {
      await updateProfile({
        full_name: profileForm.fullName.trim(),
        specialization: profileForm.specialization.trim() || null,
        institution: profileForm.institution.trim() || null,
      });

      setProfileMessage({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setProfileMessage(null);
      }, 1000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setProfileMessage({
        type: "error",
        text: err.message || "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & New Study CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome, {doctorGreeting}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {profile?.institution ? `${profile.institution} • ` : ""}
            {profile?.specialization ? `${profile.specialization} • ` : ""}
            Manage clinical studies and research datasets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditProfileOpen(true)}
            className="gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setCreateStudyError(null);
              setIsCreateModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Research Study</span>
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-1">
          <CardHeader className="p-4 space-y-1">
            <span className="text-xs text-slate-400">Research Studies</span>
            <div className="text-2xl font-bold text-white">
              {isLoadingStudies ? "..." : studies.length}
            </div>
          </CardHeader>
        </Card>

        <Card className="p-1">
          <CardHeader className="p-4 space-y-1">
            <span className="text-xs text-slate-400">Records</span>
            <div className="text-2xl font-bold text-white">
              {isLoadingStudies ? "..." : totalRecordsCount}
            </div>
          </CardHeader>
        </Card>

        <Card className="p-1">
          <CardHeader className="p-4 space-y-1">
            <span className="text-xs text-slate-400">AI Insights</span>
            <div className="text-2xl font-bold text-slate-500">—</div>
          </CardHeader>
        </Card>
      </div>

      {/* STUDIES LIST / EMPTY STATE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Active Protocols & Studies</h2>
          <span className="text-xs text-slate-400">
            {studies.length} {studies.length === 1 ? "study" : "studies"} registered
          </span>
        </div>

        {isLoadingStudies ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-xl border border-slate-800 bg-[#0f1523]/40 animate-pulse p-5 space-y-3"
              >
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800/60 rounded w-full" />
                <div className="h-3 bg-slate-800/60 rounded w-5/6" />
                <div className="pt-4 flex justify-between">
                  <div className="h-3 bg-slate-800 rounded w-20" />
                  <div className="h-3 bg-slate-800 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : studies.length === 0 ? (
          /* Empty State Card */
          <Card className="p-12 text-center border-dashed border-slate-800 bg-[#0f1523]/50">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="h-10 w-10 rounded-xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  No research studies yet.
                </h3>
                <p className="text-xs text-slate-400">
                  Get started by creating your first clinical research study protocol.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create your first study</span>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Real Studies Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studies.map((study) => {
              const formattedDate = new Date(study.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={study.id}
                  onClick={() => router.push(`/studies/${study.id}`)}
                  className="rounded-xl border border-slate-800 bg-[#0f1523] p-5 shadow-sm hover:border-teal-500/50 hover:bg-[#121929] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white group-hover:text-teal-400 transition-colors line-clamp-1">
                        {study.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 shrink-0">
                        Draft
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {study.research_objective || "No research objective specified."}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-1 text-teal-400 group-hover:translate-x-0.5 transition-transform font-medium">
                      <span>{study.records_count || 0} records</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE RESEARCH STUDY MODAL */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Research Study"
        description="Define a new clinical research protocol to begin patient data collection."
        size="lg"
      >
        <form onSubmit={handleCreateStudy} className="space-y-4 pt-2">
          {createStudyError && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{createStudyError}</span>
            </div>
          )}

          <Input
            label="Study Title *"
            value={studyTitle}
            onChange={(e) => setStudyTitle(e.target.value)}
            placeholder="e.g. Observational Study on Lipid Modulators in Cardiovascular Health"
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-medium text-slate-300">
              Research Objective *
            </label>
            <textarea
              value={researchObjective}
              onChange={(e) => setResearchObjective(e.target.value)}
              placeholder="Describe the clinical aim, target patient population, and primary endpoints..."
              rows={4}
              required
              className="w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
            />
          </div>

          <Input
            label="Research Domain (Optional)"
            value={researchDomain}
            onChange={(e) => setResearchDomain(e.target.value)}
            placeholder="e.g. Cardiology, Oncology, Endocrinology"
            helperText="Therapeutic category or medical discipline"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isCreatingStudy}
            >
              Create Study
            </Button>
          </div>
        </form>
      </Dialog>

      {/* EDIT PROFILE DIALOG */}
      <Dialog
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
        description="Update your researcher credentials and affiliation."
        size="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          {profileMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                profileMessage.type === "success"
                  ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
                  : "bg-rose-950/40 text-rose-300 border border-rose-800"
              }`}
            >
              {profileMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <Input
            label="Full Name *"
            value={profileForm.fullName}
            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
            placeholder="e.g. Dr. Elena Vance"
            required
          />

          <Input
            label="Specialization"
            value={profileForm.specialization}
            onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
            placeholder="e.g. Cardiology, Oncology"
            helperText="Primary therapeutic research area"
          />

          <Input
            label="Institution"
            value={profileForm.institution}
            onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })}
            placeholder="e.g. Stanford University Medical Center"
            helperText="Affiliated hospital or research laboratory"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSavingProfile}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
