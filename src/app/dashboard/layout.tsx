"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/navigation/dashboard-sidebar";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { useAuth } from "@/contexts/auth-context";
import { Activity } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isConfigured = supabaseUrl && !supabaseUrl.includes("your-project-id");

    if (!loading && !user && isConfigured) {
      router.push("/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white animate-pulse">
            <Activity className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-400">Loading ClinScope...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      {/* Sidebar navigation */}
      <DashboardSidebar className="hidden lg:flex" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
