"use client";

import * as React from "react";
import { FormSchema, ResearchRecord } from "@/lib/supabase/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Edit3, Shield, FileText } from "lucide-react";

interface RecordViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: FormSchema;
  record: ResearchRecord | null;
  onEdit?: (record: ResearchRecord) => void;
}

export function RecordViewModal({
  isOpen,
  onClose,
  schema,
  record,
  onEdit,
}: RecordViewModalProps) {
  if (!record) return null;

  const responses = record.responses || {};
  const formattedDate = new Date(record.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatFieldValue = (value: any): string => {
    if (value === undefined || value === null || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
    return String(value);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Clinical Record: ${record.research_id}`}
      description="De-identified research dataset entry."
      size="lg"
    >
      <div className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto pr-1 text-slate-100">
        {/* Record Header Meta */}
        <div className="rounded-xl border border-slate-800 bg-[#0b101d] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Research ID:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-teal-950/80 text-teal-300 border border-teal-800/60">
              {record.research_id}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Recorded on {formattedDate}</span>
          </div>
        </div>

        {/* Sections & Data */}
        <div className="space-y-5">
          {(schema.sections || []).map((section, sIdx) => (
            <div
              key={section.id || sIdx}
              className="rounded-xl border border-slate-800 bg-[#0f1523] p-5 space-y-3.5"
            >
              <div className="border-b border-slate-800/80 pb-2">
                <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  {section.title}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {(section.fields || []).map((field, fIdx) => {
                  const fieldKey = field.id || field.label;
                  const rawValue = responses[fieldKey];
                  const displayValue = formatFieldValue(rawValue);

                  return (
                    <div
                      key={fieldKey}
                      className={`p-3 rounded-lg bg-[#0b101d] border border-slate-800/60 ${
                        field.type === "textarea" ? "sm:col-span-2" : ""
                      }`}
                    >
                      <span className="text-[11px] text-slate-400 block mb-1 font-medium">
                        {field.label}
                      </span>
                      <span
                        className={`font-medium ${
                          displayValue === "—"
                            ? "text-slate-600 italic"
                            : "text-slate-100"
                        }`}
                      >
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-[#0f1523] pb-1">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {onEdit && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Record</span>
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
