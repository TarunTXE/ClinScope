"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  FolderGit2,
  FileSpreadsheet,
  Database,
  BrainCircuit,
  LogOut,
  User,
  ChevronRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const rawName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "";
  const doctorName = rawName
    ? rawName.startsWith("Dr.") || rawName.startsWith("dr.")
      ? rawName
      : `Dr. ${rawName}`
    : "Doctor";

  // Check if current route is inside a specific study: /studies/[id]
  const studyMatch = pathname?.match(/^\/studies\/([^/]+)/);
  const currentStudyId = studyMatch ? studyMatch[1] : null;

  return (
    <aside
      className={cn(
        "flex flex-col w-60 border-r border-slate-800/80 bg-[#0c111e] p-4 shrink-0 transition-all",
        className
      )}
    >
      {/* Brand logo */}
      <div className="flex items-center gap-2.5 px-2 py-2 mb-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
          <Activity className="h-3.5 w-3.5" />
        </div>
        <Link href="/" className="text-sm font-semibold text-white tracking-tight">
          ClinScope
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-6">
        {/* Global Nav */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Research Workspace
          </div>

          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
              pathname === "/dashboard"
                ? "bg-slate-800 text-white font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            )}
          >
            <FolderGit2 className="w-4 h-4 text-teal-400" />
            <span>Research Studies</span>
          </Link>
        </div>

        {/* Contextual Study Navigation if in Study Workspace */}
        {currentStudyId ? (
          <div className="space-y-1 pt-2 border-t border-slate-800/60">
            <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Active Study</span>
              <span className="text-teal-400 font-mono text-[9px]">WORKSPACE</span>
            </div>

            <Link
              href={`/studies/${currentStudyId}`}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                pathname === `/studies/${currentStudyId}`
                  ? "bg-teal-950/60 text-teal-300 border border-teal-800/50 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Study Protocol</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-1 pt-2 border-t border-slate-800/60">
            <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Capabilities
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>AI Form Design</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Data Collection</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <BrainCircuit className="w-4 h-4 text-violet-400" />
              <span>AI Insights</span>
            </Link>
          </div>
        )}
      </div>

      {/* User profile & Sign out */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="px-2 py-1">
          <p className="text-xs font-medium text-white truncate" title={doctorName}>
            {doctorName}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {profile?.email || user?.email || "Principal Investigator"}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
