"use client";

import * as React from "react";
import { Sparkles, AlertCircle, Info, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSchema } from "@/lib/supabase/types";

interface GenerateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyTitle: string;
  defaultObjective?: string;
  onGenerated: (schema: FormSchema) => void;
}

export function GenerateFormModal({
  isOpen,
  onClose,
  studyTitle,
  defaultObjective = "",
  onGenerated,
}: GenerateFormModalProps) {
  const [objective, setObjective] = React.useState(defaultObjective);
  const [domain, setDomain] = React.useState("");
  const [additionalInstructions, setAdditionalInstructions] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Sync defaultObjective when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setObjective(defaultObjective);
      setErrorMessage(null);
    }
  }, [isOpen, defaultObjective]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!objective.trim()) {
      setErrorMessage("Please specify the research objective.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studyTitle,
          researchObjective: objective.trim(),
          researchDomain: domain.trim(),
          additionalInstructions: additionalInstructions.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate research form.");
      }

      if (data.schema) {
        onGenerated(data.schema);
        onClose();
      } else {
        throw new Error("Invalid form schema received from Gemini.");
      }
    } catch (err: any) {
      console.error("Form generation failed:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred while communicating with Gemini."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => !isGenerating && onClose()}
      title="Generate Research Form with AI"
      description="Leverage Gemini to structure clinical observation fields based on your research protocol."
      size="lg"
    >
      <form onSubmit={handleGenerate} className="space-y-4 pt-2">
        {errorMessage && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-medium text-slate-300">
            Study Protocol Title
          </label>
          <div className="p-2.5 rounded-lg bg-[#0b101d] border border-slate-800 text-xs text-slate-200 font-medium">
            {studyTitle}
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-medium text-slate-300">
            Research Objective *
          </label>
          <textarea
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            disabled={isGenerating}
            placeholder="e.g. Evaluate primary therapeutic outcomes and hepatic biomarkers in patients..."
            required
            className="w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-colors resize-none"
          />
        </div>

        <Input
          label="Research Domain / Specialization"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={isGenerating}
          placeholder="e.g. Cardiology, Oncology, Endocrinology, Neurology"
          helperText="Guides appropriate terminology and clinical ranges"
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-medium text-slate-300">
            Optional Additional Instructions
          </label>
          <textarea
            rows={2}
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            disabled={isGenerating}
            placeholder="e.g. Include 12-lead ECG measurements, baseline fasting lipid panel, and pain severity scale (1-10)..."
            className="w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-50 transition-colors resize-none"
          />
        </div>

        {/* Safety Note */}
        <div className="p-3 rounded-lg border border-teal-900/40 bg-teal-950/20 text-teal-300 text-[11px] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-teal-200">Safety Notice: </strong>
            AI-generated form — review and customize before collecting research data. ClinScope generates research data-collection fields only, not medical diagnoses or treatment recommendations.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            isLoading={isGenerating}
            disabled={isGenerating}
            className="gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Generating Schema..." : "Generate Form"}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
