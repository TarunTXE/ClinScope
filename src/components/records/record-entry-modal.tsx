"use client";

import * as React from "react";
import { FormSchema, FormSection, FormField, ResearchRecord } from "@/lib/supabase/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Shield, Info } from "lucide-react";

interface RecordEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: FormSchema;
  studyId: string;
  existingRecord?: ResearchRecord | null;
  generatedResearchId?: string;
  onSave: (recordData: { research_id: string; responses: Record<string, any> }) => Promise<void>;
  isSaving?: boolean;
}

export function RecordEntryModal({
  isOpen,
  onClose,
  schema,
  studyId,
  existingRecord = null,
  generatedResearchId = "RS-0001",
  onSave,
  isSaving = false,
}: RecordEntryModalProps) {
  const isEditing = Boolean(existingRecord);
  const researchId = existingRecord?.research_id || generatedResearchId;

  // Form responses state: mapped by field.id (or fallback label)
  const [responses, setResponses] = React.useState<Record<string, any>>({});
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Initialize form state when opened or record changes
  React.useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      if (existingRecord?.responses) {
        setResponses({ ...existingRecord.responses });
      } else {
        setResponses({});
      }
    }
  }, [isOpen, existingRecord]);

  const handleInputChange = (fieldKey: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleCheckboxChange = (fieldKey: string, option: string) => {
    setResponses((prev) => {
      const current = Array.isArray(prev[fieldKey]) ? prev[fieldKey] : [];
      const updated = current.includes(option)
        ? current.filter((item: string) => item !== option)
        : [...current, option];
      return {
        ...prev,
        [fieldKey]: updated,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate fields according to schema
    for (const section of schema.sections || []) {
      for (const field of section.fields || []) {
        const fieldKey = field.id || field.label;
        const val = responses[fieldKey];

        const isEmpty =
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0);

        // 1. Required field check
        if (field.required && isEmpty) {
          setValidationError(
            `Please fill in required field: "${field.label}" in section "${section.title}".`
          );
          return;
        }

        // 2. Number validation
        if (!isEmpty && field.type === "number") {
          const num = Number(val);
          if (isNaN(num)) {
            setValidationError(
              `Field "${field.label}" must be a valid number.`
            );
            return;
          }
        }

        // 3. Date validation
        if (!isEmpty && field.type === "date") {
          const date = new Date(val);
          if (isNaN(date.getTime())) {
            setValidationError(
              `Field "${field.label}" contains an invalid date.`
            );
            return;
          }
        }
      }
    }

    try {
      await onSave({
        research_id: researchId,
        responses,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || "Failed to save record.");
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => !isSaving && onClose()}
      title={isEditing ? `Edit Record ${researchId}` : `Add Research Record (${researchId})`}
      description="Enter observational research data according to the published protocol schema."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2 max-h-[75vh] overflow-y-auto pr-1">
        {/* Research ID & Protocol Badge */}
        <div className="rounded-xl border border-slate-800 bg-[#0b101d] p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Research ID:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-teal-950/80 text-teal-300 border border-teal-800/60">
              {researchId}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>De-identified Patient Research Entry</span>
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Dynamic Sections & Fields */}
        <div className="space-y-6">
          {(schema.sections || []).map((section, sIdx) => (
            <div
              key={section.id || sIdx}
              className="rounded-xl border border-slate-800 bg-[#0f1523] p-5 space-y-4"
            >
              <div className="border-b border-slate-800/80 pb-2.5">
                <h4 className="text-sm font-semibold text-white tracking-wide">
                  {section.title}
                </h4>
                {section.description && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {section.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(section.fields || []).map((field, fIdx) => {
                  const fieldKey = field.id || field.label;
                  const value = responses[fieldKey];

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
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          {field.type}
                        </span>
                      </div>

                      {/* Text Input */}
                      {field.type === "text" && (
                        <input
                          type="text"
                          value={value !== undefined ? value : ""}
                          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                          placeholder={field.placeholder || "Enter value..."}
                          className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      )}

                      {/* Number Input */}
                      {field.type === "number" && (
                        <input
                          type="number"
                          step="any"
                          value={value !== undefined ? value : ""}
                          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                          placeholder={field.placeholder || "e.g. 0.00"}
                          className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      )}

                      {/* Textarea Input */}
                      {field.type === "textarea" && (
                        <textarea
                          rows={3}
                          value={value !== undefined ? value : ""}
                          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                          placeholder={field.placeholder || "Enter notes..."}
                          className="w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                        />
                      )}

                      {/* Date Input */}
                      {field.type === "date" && (
                        <input
                          type="date"
                          value={value !== undefined ? value : ""}
                          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                          className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      )}

                      {/* Select Dropdown */}
                      {field.type === "select" && (
                        <select
                          value={value !== undefined ? value : ""}
                          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                          className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="">Select an option...</option>
                          {(field.options || []).map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Radio Buttons */}
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
                                onChange={() => handleInputChange(fieldKey, opt)}
                                className="accent-teal-500 h-3.5 w-3.5"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Checkboxes */}
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
                                    onChange={() => handleCheckboxChange(fieldKey, opt)}
                                    className="accent-teal-500 h-3.5 w-3.5 rounded"
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
                                onChange={(e) =>
                                  handleInputChange(fieldKey, e.target.checked)
                                }
                                className="accent-teal-500 h-3.5 w-3.5 rounded"
                              />
                              <span>Confirmed / Present</span>
                            </label>
                          )}
                        </div>
                      )}

                      {/* Boolean Yes/No */}
                      {field.type === "boolean" && (
                        <div className="flex items-center gap-4 pt-1">
                          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name={fieldKey}
                              checked={value === "Yes" || value === true}
                              onChange={() => handleInputChange(fieldKey, "Yes")}
                              className="accent-teal-500 h-3.5 w-3.5"
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="radio"
                              name={fieldKey}
                              checked={value === "No" || value === false}
                              onChange={() => handleInputChange(fieldKey, "No")}
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

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-[#0f1523] pb-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            isLoading={isSaving}
            disabled={isSaving}
            className="bg-teal-600 hover:bg-teal-500 text-white font-medium"
          >
            {isEditing ? "Save Changes" : "Save Research Record"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
