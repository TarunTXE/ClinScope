"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSchema, FormSection, FormField, FieldType } from "@/lib/supabase/types";
import { FormPreview } from "./form-preview";

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short Text" },
  { value: "number", label: "Number / Metric" },
  { value: "textarea", label: "Long Textarea" },
  { value: "select", label: "Dropdown Select" },
  { value: "radio", label: "Single Choice (Radio)" },
  { value: "checkbox", label: "Multi-Choice Checkbox" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes / No (Boolean)" },
];

interface FormBuilderProps {
  initialSchema: FormSchema;
  status?: "draft" | "published";
  onSave: (schema: FormSchema, targetStatus: "draft" | "published") => Promise<void>;
  isSaving?: boolean;
  onRegenerate?: () => void;
}

export function FormBuilder({
  initialSchema,
  status = "draft",
  onSave,
  isSaving = false,
  onRegenerate,
}: FormBuilderProps) {
  const [schema, setSchema] = React.useState<FormSchema>(initialSchema);
  const [activeMode, setActiveMode] = React.useState<"edit" | "preview">("edit");
  const [expandedSectionIds, setExpandedSectionIds] = React.useState<Record<string, boolean>>({});
  const [feedbackMessage, setFeedbackMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync schema when initialSchema changes
  React.useEffect(() => {
    setSchema(initialSchema);
  }, [initialSchema]);

  // Section Handlers
  const handleAddSection = () => {
    const newSectionId = `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSection: FormSection = {
      id: newSectionId,
      title: `New Section ${schema.sections.length + 1}`,
      description: "",
      fields: [
        {
          id: `fld_${Date.now()}_0`,
          label: "Sample Observation Field",
          type: "text",
          required: false,
          options: [],
          placeholder: "",
        },
      ],
    };

    setSchema((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const handleUpdateSection = (sectionIndex: number, updates: Partial<FormSection>) => {
    setSchema((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        ...updates,
      };
      return { ...prev, sections: updatedSections };
    });
  };

  const handleDeleteSection = (sectionIndex: number) => {
    if (schema.sections.length <= 1) {
      alert("A form must contain at least one section.");
      return;
    }

    setSchema((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== sectionIndex),
    }));
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= schema.sections.length) return;

    setSchema((prev) => {
      const updatedSections = [...prev.sections];
      const temp = updatedSections[index];
      updatedSections[index] = updatedSections[targetIndex];
      updatedSections[targetIndex] = temp;
      return { ...prev, sections: updatedSections };
    });
  };

  // Field Handlers
  const handleAddField = (sectionIndex: number) => {
    const newFieldId = `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newField: FormField = {
      id: newFieldId,
      label: "New Field",
      type: "text",
      required: false,
      options: [],
      placeholder: "",
    };

    setSchema((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        fields: [...updatedSections[sectionIndex].fields, newField],
      };
      return { ...prev, sections: updatedSections };
    });
  };

  const handleUpdateField = (
    sectionIndex: number,
    fieldIndex: number,
    updates: Partial<FormField>
  ) => {
    setSchema((prev) => {
      const updatedSections = [...prev.sections];
      const fields = [...updatedSections[sectionIndex].fields];
      fields[fieldIndex] = {
        ...fields[fieldIndex],
        ...updates,
      };

      // Set default options if field type changed to select/radio/checkbox and options is empty
      if (
        updates.type &&
        ["select", "radio", "checkbox"].includes(updates.type) &&
        (!fields[fieldIndex].options || fields[fieldIndex].options.length === 0)
      ) {
        fields[fieldIndex].options = ["Option 1", "Option 2"];
      }

      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        fields,
      };
      return { ...prev, sections: updatedSections };
    });
  };

  const handleDeleteField = (sectionIndex: number, fieldIndex: number) => {
    setSchema((prev) => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        fields: updatedSections[sectionIndex].fields.filter((_, idx) => idx !== fieldIndex),
      };
      return { ...prev, sections: updatedSections };
    });
  };

  const handleMoveField = (
    sectionIndex: number,
    fieldIndex: number,
    direction: "up" | "down"
  ) => {
    const targetIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
    const currentFields = schema.sections[sectionIndex].fields;
    if (targetIndex < 0 || targetIndex >= currentFields.length) return;

    setSchema((prev) => {
      const updatedSections = [...prev.sections];
      const fields = [...updatedSections[sectionIndex].fields];
      const temp = fields[fieldIndex];
      fields[fieldIndex] = fields[targetIndex];
      fields[targetIndex] = temp;
      updatedSections[sectionIndex] = {
        ...updatedSections[sectionIndex],
        fields,
      };
      return { ...prev, sections: updatedSections };
    });
  };

  // Option Handlers for Select/Radio/Checkbox
  const handleAddOption = (sectionIndex: number, fieldIndex: number) => {
    const field = schema.sections[sectionIndex].fields[fieldIndex];
    const currentOptions = field.options || [];
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];

    handleUpdateField(sectionIndex, fieldIndex, { options: newOptions });
  };

  const handleUpdateOption = (
    sectionIndex: number,
    fieldIndex: number,
    optionIndex: number,
    newValue: string
  ) => {
    const field = schema.sections[sectionIndex].fields[fieldIndex];
    const newOptions = [...(field.options || [])];
    newOptions[optionIndex] = newValue;

    handleUpdateField(sectionIndex, fieldIndex, { options: newOptions });
  };

  const handleDeleteOption = (
    sectionIndex: number,
    fieldIndex: number,
    optionIndex: number
  ) => {
    const field = schema.sections[sectionIndex].fields[fieldIndex];
    const newOptions = (field.options || []).filter((_, idx) => idx !== optionIndex);

    handleUpdateField(sectionIndex, fieldIndex, { options: newOptions });
  };

  // Save / Publish Actions
  const handleSaveDraft = async () => {
    setFeedbackMessage(null);
    try {
      await onSave(schema, "draft");
      setFeedbackMessage({
        type: "success",
        text: "Draft saved successfully.",
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err?.message || "Failed to save draft.",
      });
    }
  };

  const handlePublish = async () => {
    setFeedbackMessage(null);
    const confirmed = window.confirm(
      "Are you sure you want to publish this research form? Once published, this form schema will be locked as the active protocol for clinical data collection."
    );
    if (!confirmed) return;

    try {
      await onSave(schema, "published");
      setFeedbackMessage({
        type: "success",
        text: "Research form published successfully!",
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err?.message || "Failed to publish form.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Header */}
      <div className="rounded-xl border border-slate-800 bg-[#0f1523] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-800 bg-[#0b101d] p-0.5">
            <button
              type="button"
              onClick={() => setActiveMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeMode === "edit"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Schema Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeMode === "preview"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Preview</span>
            </button>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              status === "published"
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                : "bg-amber-950/60 text-amber-300 border-amber-800/60"
            }`}
          >
            {status === "published" ? "Published Protocol" : "Draft Schema"}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isSaving}
              className="text-xs gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Regenerate with AI</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            disabled={isSaving}
            className="text-xs gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePublish}
            isLoading={isSaving}
            disabled={isSaving}
            className="text-xs gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-medium"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Publish Form</span>
          </Button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedbackMessage.type === "success"
              ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300"
              : "border-rose-800/60 bg-rose-950/40 text-rose-300"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* PREVIEW MODE */}
      {activeMode === "preview" && (
        <FormPreview
          schema={schema}
          status={status}
          onEdit={() => setActiveMode("edit")}
          interactive
        />
      )}

      {/* EDIT MODE */}
      {activeMode === "edit" && (
        <div className="space-y-6">
          {/* Form Header Details */}
          <div className="rounded-xl border border-slate-800 bg-[#0f1523] p-5 sm:p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Form Protocol Title
              </label>
              <input
                type="text"
                value={schema.title}
                onChange={(e) => setSchema({ ...schema, title: e.target.value })}
                placeholder="e.g. Observational Lipid Panel Data Collection"
                className="flex h-10 w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3.5 py-2 text-sm text-white font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Form Protocol Description (Optional)
              </label>
              <textarea
                rows={2}
                value={schema.description || ""}
                onChange={(e) => setSchema({ ...schema, description: e.target.value })}
                placeholder="Clinical data collection instructions for researchers and clinicians..."
                className="w-full rounded-lg border border-slate-800 bg-[#0b101d] px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-6">
            {schema.sections.map((section, sIdx) => {
              const sectionId = section.id || `sec_${sIdx}`;

              return (
                <div
                  key={sectionId}
                  className="rounded-xl border border-slate-800 bg-[#0f1523] p-5 sm:p-6 space-y-5 transition-all shadow-sm"
                >
                  {/* Section Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-md bg-slate-800 text-teal-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            handleUpdateSection(sIdx, { title: e.target.value })
                          }
                          placeholder="Section Title"
                          className="flex h-8 w-full max-w-md rounded-md border border-slate-800 bg-[#0b101d] px-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <input
                        type="text"
                        value={section.description || ""}
                        onChange={(e) =>
                          handleUpdateSection(sIdx, { description: e.target.value })
                        }
                        placeholder="Optional section instructions..."
                        className="flex h-7 w-full max-w-lg rounded-md border border-slate-800/60 bg-[#0b101d]/60 px-2.5 text-[11px] text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={sIdx === 0}
                        onClick={() => handleMoveSection(sIdx, "up")}
                        title="Move section up"
                        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={sIdx === schema.sections.length - 1}
                        onClick={() => handleMoveSection(sIdx, "down")}
                        title="Move section down"
                        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sIdx)}
                        title="Delete section"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Fields in Section */}
                  <div className="space-y-4">
                    {section.fields.map((field, fIdx) => {
                      const fieldId = field.id || `fld_${sIdx}_${fIdx}`;
                      const hasOptions = ["select", "radio", "checkbox"].includes(
                        field.type
                      );

                      return (
                        <div
                          key={fieldId}
                          className="rounded-lg border border-slate-800/70 bg-[#0b101d] p-4 space-y-3.5 hover:border-slate-700/80 transition-colors"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                            {/* Label */}
                            <div className="md:col-span-5 space-y-1">
                              <label className="block text-[11px] font-medium text-slate-400">
                                Field Label
                              </label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  handleUpdateField(sIdx, fIdx, {
                                    label: e.target.value,
                                  })
                                }
                                placeholder="e.g. Systolic Blood Pressure"
                                className="flex h-8 w-full rounded-md border border-slate-800 bg-[#0e1424] px-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>

                            {/* Type */}
                            <div className="md:col-span-3 space-y-1">
                              <label className="block text-[11px] font-medium text-slate-400">
                                Input Type
                              </label>
                              <select
                                value={field.type}
                                onChange={(e) =>
                                  handleUpdateField(sIdx, fIdx, {
                                    type: e.target.value as FieldType,
                                  })
                                }
                                className="flex h-8 w-full rounded-md border border-slate-800 bg-[#0e1424] px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                              >
                                {FIELD_TYPE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Required Switch */}
                            <div className="md:col-span-2 space-y-1">
                              <label className="block text-[11px] font-medium text-slate-400">
                                Requirement
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateField(sIdx, fIdx, {
                                    required: !field.required,
                                  })
                                }
                                className={`flex h-8 w-full items-center justify-center rounded-md text-[11px] font-medium border transition-colors ${
                                  field.required
                                    ? "bg-rose-950/40 text-rose-300 border-rose-800/60"
                                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                                }`}
                              >
                                {field.required ? "Required" : "Optional"}
                              </button>
                            </div>

                            {/* Move / Delete Actions */}
                            <div className="md:col-span-2 flex items-center justify-end gap-1 pt-4 md:pt-5">
                              <button
                                type="button"
                                disabled={fIdx === 0}
                                onClick={() => handleMoveField(sIdx, fIdx, "up")}
                                title="Move field up"
                                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={fIdx === section.fields.length - 1}
                                onClick={() => handleMoveField(sIdx, fIdx, "down")}
                                title="Move field down"
                                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteField(sIdx, fIdx)}
                                title="Delete field"
                                className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Options Editor for Select / Radio / Checkbox */}
                          {hasOptions && (
                            <div className="p-3 rounded-md bg-[#0e1424] border border-slate-800/60 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium text-slate-300">
                                  Allowed Options
                                </span>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleAddOption(sIdx, fIdx)}
                                  className="h-6 text-[11px] px-2 text-teal-400 hover:text-teal-300 hover:bg-teal-950/30 gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Option</span>
                                </Button>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-1">
                                {(field.options || []).map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className="flex items-center gap-1 rounded-md bg-slate-900 border border-slate-700/60 px-2 py-1"
                                  >
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) =>
                                        handleUpdateOption(sIdx, fIdx, oIdx, e.target.value)
                                      }
                                      className="bg-transparent text-[11px] text-slate-200 focus:outline-none w-24 sm:w-28"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteOption(sIdx, fIdx, oIdx)}
                                      className="text-slate-500 hover:text-rose-400 p-0.5"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Field Button */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddField(sIdx)}
                      className="w-full text-xs gap-1.5 border-dashed border-slate-800 hover:border-teal-500/50 hover:bg-teal-950/10 text-slate-300 hover:text-teal-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Field to {section.title}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Section Button */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleAddSection}
              className="w-full gap-2 border-slate-800 hover:border-slate-700 text-white font-medium py-3"
            >
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Add New Section</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
