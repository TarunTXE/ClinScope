"use client";

import * as React from "react";
import { FormSchema, FormSection, FormField } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Info, Calendar as CalendarIcon, HelpCircle } from "lucide-react";

interface FormPreviewProps {
  schema: FormSchema;
  status?: "draft" | "published";
  onEdit?: () => void;
  interactive?: boolean;
}

export function FormPreview({
  schema,
  status = "draft",
  onEdit,
  interactive = true,
}: FormPreviewProps) {
  // Sample test state for interactive preview
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [testSubmitted, setTestSubmitted] = React.useState(false);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      const updated = current.includes(option)
        ? current.filter((item: string) => item !== option)
        : [...current, option];
      return { ...prev, [fieldId]: updated };
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Form Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0f1523] p-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {schema.title || "Clinical Research Data Collection Form"}
              </h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  status === "published"
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                    : "bg-amber-950/60 text-amber-300 border-amber-800/60"
                }`}
              >
                {status === "published" ? "Published Protocol" : "Draft Protocol"}
              </span>
            </div>
            {schema.description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {schema.description}
              </p>
            )}
          </div>

          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="text-xs shrink-0"
            >
              Edit Form Schema
            </Button>
          )}
        </div>
      </div>

      {/* Safety Banner */}
      <div className="p-3.5 rounded-xl border border-teal-900/40 bg-teal-950/20 text-teal-300 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-teal-200">Clinical Protocol Notice: </span>
          AI-generated form — review and customize before collecting research data. This form is designed strictly for research data gathering and does not provide clinical diagnoses.
        </div>
      </div>

      {/* Sections & Fields */}
      <div className="space-y-6">
        {schema.sections?.map((section, sIdx) => (
          <div
            key={section.id || sIdx}
            className="rounded-xl border border-slate-800 bg-[#0f1523] p-6 space-y-5"
          >
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white tracking-wide">
                {section.title || `Section ${sIdx + 1}`}
              </h3>
              {section.description && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {section.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields?.map((field, fIdx) => {
                const fieldKey = field.id || `f_${sIdx}_${fIdx}`;
                const value = formData[fieldKey];

                return (
                  <div
                    key={fieldKey}
                    className={`space-y-1.5 ${
                      field.type === "textarea" ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-300">
                        {field.label}
                        {field.required && (
                          <span className="text-rose-400 ml-1 font-bold">*</span>
                        )}
                      </label>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                        {field.type}
                      </span>
                    </div>

                    {/* Field input types */}
                    {field.type === "text" && (
                      <input
                        type="text"
                        disabled={!interactive}
                        value={value || ""}
                        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                        placeholder={field.placeholder || "Enter text..."}
                        className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60 transition-colors"
                      />
                    )}

                    {field.type === "number" && (
                      <input
                        type="number"
                        disabled={!interactive}
                        value={value || ""}
                        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                        placeholder={field.placeholder || "e.g. 0.00"}
                        className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60 transition-colors"
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        rows={3}
                        disabled={!interactive}
                        value={value || ""}
                        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                        placeholder={field.placeholder || "Enter clinical observations..."}
                        className="w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60 transition-colors resize-none"
                      />
                    )}

                    {field.type === "date" && (
                      <input
                        type="date"
                        disabled={!interactive}
                        value={value || ""}
                        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60 transition-colors"
                      />
                    )}

                    {field.type === "select" && (
                      <select
                        disabled={!interactive}
                        value={value || ""}
                        onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                        className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-60 transition-colors"
                      >
                        <option value="">Select option...</option>
                        {(field.options || []).map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === "radio" && (
                      <div className="space-y-1.5 pt-1">
                        {(field.options || []).map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={fieldKey}
                              value={opt}
                              checked={value === opt}
                              disabled={!interactive}
                              onChange={() => handleInputChange(fieldKey, opt)}
                              className="accent-teal-500 h-3.5 w-3.5 bg-slate-900 border-slate-700"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === "checkbox" && (
                      <div className="space-y-1.5 pt-1">
                        {field.options && field.options.length > 0 ? (
                          field.options.map((opt, oIdx) => {
                            const checkedList = Array.isArray(value) ? value : [];
                            const isChecked = checkedList.includes(opt);
                            return (
                              <label
                                key={oIdx}
                                className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={isChecked}
                                  disabled={!interactive}
                                  onChange={() => handleCheckboxChange(fieldKey, opt)}
                                  className="accent-teal-500 h-3.5 w-3.5 rounded bg-slate-900 border-slate-700"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })
                        ) : (
                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(value)}
                              disabled={!interactive}
                              onChange={(e) => handleInputChange(fieldKey, e.target.checked)}
                              className="accent-teal-500 h-3.5 w-3.5 rounded bg-slate-900 border-slate-700"
                            />
                            <span>Confirmed / Present</span>
                          </label>
                        )}
                      </div>
                    )}

                    {field.type === "boolean" && (
                      <div className="flex items-center gap-4 pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name={fieldKey}
                            checked={value === "yes" || value === true}
                            disabled={!interactive}
                            onChange={() => handleInputChange(fieldKey, true)}
                            className="accent-teal-500 h-3.5 w-3.5"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="radio"
                            name={fieldKey}
                            checked={value === "no" || value === false}
                            disabled={!interactive}
                            onChange={() => handleInputChange(fieldKey, false)}
                            className="accent-teal-500 h-3.5 w-3.5"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    )}

                    {field.description && (
                      <p className="text-[11px] text-slate-500">{field.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Form Test Feedback */}
      {interactive && (
        <div className="rounded-xl border border-slate-800 bg-[#0f1523] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Interactive Preview: </span>
            This interactive test area lets you test input behavior before publishing.
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFormData({});
              alert("Preview test inputs cleared.");
            }}
            className="text-xs shrink-0"
          >
            Clear Test Data
          </Button>
        </div>
      )}
    </div>
  );
}
