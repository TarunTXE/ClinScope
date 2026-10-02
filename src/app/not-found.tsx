"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-950/80 text-teal-400 mb-4 border border-teal-800/50">
        <Activity className="h-7 w-7" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
        404
      </h1>
      <h2 className="text-lg font-bold text-slate-200 mb-2">
        Clinical Protocol / Page Not Found
      </h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        The requested clinical resource or page does not exist or has been relocated within the research registry.
      </p>
      <Link href="/">
        <Button variant="primary" size="md" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Button>
      </Link>
    </div>
  );
}
