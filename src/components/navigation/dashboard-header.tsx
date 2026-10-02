"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function DashboardHeader() {
  const { user, profile, signOut } = useAuth();

  const rawName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const displayName = rawName
    ? rawName.startsWith("Dr.") || rawName.startsWith("dr.")
      ? rawName
      : `Dr. ${rawName}`
    : "Doctor";

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-800/80 bg-[#090d16]/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-medium text-white">{displayName}</span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-xs text-slate-400 hover:text-white gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
