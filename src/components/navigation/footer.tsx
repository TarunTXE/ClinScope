import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a12] py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Activity className="h-3.5 w-3.5 text-teal-500" />
          <span>ClinScope — Clinical Research Platform</span>
        </div>
        <p>© {new Date().getFullYear()} ClinScope. Research software.</p>
      </div>
    </footer>
  );
}
