"use client";

import * as React from "react";
import {
  Plus,
  Database,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Search,
  ArrowRight,
  Download,
  Filter,
  X,
  FileText,
  FileCode,
  Shield,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormSchema, ResearchRecord, FormField } from "@/lib/supabase/types";
import { RecordEntryModal } from "./record-entry-modal";
import { RecordViewModal } from "./record-view-modal";

interface RecordsManagerProps {
  studyId: string;
  studyTitle?: string;
  schema: FormSchema;
  records: ResearchRecord[];
  isLoading?: boolean;
  onSaveRecord: (recordData: { id?: string; research_id: string; responses: Record<string, any> }) => Promise<void>;
  onDeleteRecord: (recordId: string) => Promise<void>;
}

export function RecordsManager({
  studyId,
  studyTitle = "Clinical Study",
  schema,
  records,
  isLoading = false,
  onSaveRecord,
  onDeleteRecord,
}: RecordsManagerProps) {
  const [isEntryModalOpen, setIsEntryModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [activeRecord, setActiveRecord] = React.useState<ResearchRecord | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Categorical Filtering State
  const [selectedFilterFieldKey, setSelectedFilterFieldKey] = React.useState<string>("");
  const [selectedFilterValue, setSelectedFilterValue] = React.useState<string>("");
  const [isExportMenuOpen, setIsExportMenuOpen] = React.useState(false);

  // Extract all fields from schema
  const allFields = React.useMemo(() => {
    const list: Array<{ key: string; label: string; field: FormField; sectionTitle: string }> = [];
    for (const sec of schema?.sections || []) {
      for (const f of sec.fields || []) {
        const key = f.id || f.label;
        list.push({ key, label: f.label, field: f, sectionTitle: sec.title });
      }
    }
    return list;
  }, [schema]);

  // Extract categorical fields for filtering
  const filterableFields = React.useMemo(() => {
    return allFields.filter(
      (f) =>
        f.field.type === "select" ||
        f.field.type === "radio" ||
        f.field.type === "checkbox" ||
        f.field.type === "boolean" ||
        (f.field.options && f.field.options.length > 0)
    );
  }, [allFields]);

  // Options for the currently selected filter field
  const currentFilterOptions = React.useMemo(() => {
    if (!selectedFilterFieldKey) return [];
    const found = filterableFields.find((f) => f.key === selectedFilterFieldKey);
    if (!found) return [];

    if (found.field.options && found.field.options.length > 0) {
      return found.field.options;
    }
    if (found.field.type === "boolean") {
      return ["Yes", "No", "true", "false"];
    }

    // Dynamic unique values from collected dataset
    const uniqueVals = new Set<string>();
    for (const r of records) {
      const v = r.responses?.[found.key] ?? r.responses?.[found.label];
      if (v !== undefined && v !== null && v !== "") {
        if (Array.isArray(v)) {
          v.forEach((item) => uniqueVals.add(String(item)));
        } else {
          uniqueVals.add(String(v));
        }
      }
    }
    return Array.from(uniqueVals);
  }, [selectedFilterFieldKey, filterableFields, records]);

  // Auto-generate next Research ID (e.g. RS-0001, RS-0002)
  const nextResearchId = React.useMemo(() => {
    const numbers = records
      .map((r) => {
        const match = r.research_id?.match(/RS-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : records.length + 1;
    return `RS-${String(nextNum).padStart(4, "0")}`;
  }, [records]);

  // Open Create Record Modal
  const handleOpenCreate = () => {
    setActiveRecord(null);
    setIsEntryModalOpen(true);
  };

  // Open Edit Record Modal
  const handleOpenEdit = (record: ResearchRecord) => {
    setActiveRecord(record);
    setIsEntryModalOpen(true);
  };

  // Open View Record Modal
  const handleOpenView = (record: ResearchRecord) => {
    setActiveRecord(record);
    setIsViewModalOpen(true);
  };

  // Handle Save
  const handleSave = async (data: { research_id: string; responses: Record<string, any> }) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSaveRecord({
        id: activeRecord?.id,
        research_id: data.research_id,
        responses: data.responses,
      });

      setFeedback({
        type: "success",
        text: activeRecord
          ? `Record ${data.research_id} updated successfully.`
          : `Record ${data.research_id} created successfully.`,
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Failed to save research record.",
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (record: ResearchRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete record ${record.research_id}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await onDeleteRecord(record.id);
      setFeedback({
        type: "success",
        text: `Record ${record.research_id} deleted successfully.`,
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Failed to delete record.",
      });
    }
  };

  // Filter records by search query and categorical selection
  const filteredRecords = React.useMemo(() => {
    return records.filter((rec) => {
      // 1. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = rec.research_id?.toLowerCase().includes(query);
        const matchesResponse = Object.entries(rec.responses || {}).some(
          ([_, val]) => {
            if (val === undefined || val === null) return false;
            return String(val).toLowerCase().includes(query);
          }
        );
        if (!matchesId && !matchesResponse) return false;
      }

      // 2. Categorical variable filter
      if (selectedFilterFieldKey && selectedFilterValue) {
        const targetField = filterableFields.find((f) => f.key === selectedFilterFieldKey);
        const rawVal =
          rec.responses?.[selectedFilterFieldKey] ??
          (targetField ? rec.responses?.[targetField.label] : undefined);

        if (rawVal === undefined || rawVal === null) return false;

        if (Array.isArray(rawVal)) {
          const match = rawVal.some(
            (item) => String(item).toLowerCase() === selectedFilterValue.toLowerCase()
          );
          if (!match) return false;
        } else {
          if (String(rawVal).toLowerCase() !== selectedFilterValue.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [records, searchQuery, selectedFilterFieldKey, selectedFilterValue, filterableFields]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedFilterFieldKey("");
    setSelectedFilterValue("");
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || (selectedFilterFieldKey && selectedFilterValue)
  );

  // CSV Export Function (flattens JSONB responses)
  const handleExportCSV = () => {
    if (!records || records.length === 0) {
      alert("No research records available to export.");
      return;
    }

    const headers = [
      "Research ID",
      ...allFields.map((f) => `"${f.label.replace(/"/g, '""')}"`),
      "Created At",
    ];

    const rows = records.map((rec) => {
      const rowValues = [
        `"${rec.research_id || ""}"`,
        ...allFields.map((f) => {
          const raw = rec.responses?.[f.key] ?? rec.responses?.[f.label];
          if (raw === undefined || raw === null) return '""';
          if (Array.isArray(raw)) {
            return `"${raw.join("; ").replace(/"/g, '""')}"`;
          }
          return `"${String(raw).replace(/"/g, '""')}"`;
        }),
        `"${new Date(rec.created_at).toISOString()}"`,
      ];
      return rowValues.join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `clinscope_${studyTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_records_${new Date().toISOString().split("T")[0]}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  // JSON Export Function
  const handleExportJSON = () => {
    if (!records || records.length === 0) {
      alert("No research records available to export.");
      return;
    }

    const exportPayload = {
      study_id: studyId,
      study_title: studyTitle,
      exported_at: new Date().toISOString(),
      total_records: records.length,
      schema_title: schema.title,
      records: records.map((r) => ({
        research_id: r.research_id,
        created_at: r.created_at,
        responses: r.responses,
      })),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportPayload, null, 2)
    )}`;
    const link = document.createElement("a");
    const filename = `clinscope_${studyTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}_records_${new Date().toISOString().split("T")[0]}.json`;

    link.setAttribute("href", jsonString);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <Card className="bg-[#0f1523] border-slate-800 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-teal-950/80 text-teal-400 border border-teal-800/40 flex items-center justify-center">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <CardTitle className="text-base sm:text-lg text-white font-bold tracking-tight">
                  Research Records Dataset
                </CardTitle>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-teal-950/60 text-teal-300 border border-teal-800/50">
                  {records.length} {records.length === 1 ? "Record" : "Records"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Observational patient case data collected under protocol:{" "}
                <span className="text-slate-200 font-medium">{schema.title}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Export Data Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  disabled={records.length === 0}
                  className="gap-1.5 text-xs text-slate-300 hover:text-white border-slate-700 bg-[#0b101d]"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Export Data</span>
                </Button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0f1523] border border-slate-700 shadow-2xl z-50 p-1.5 space-y-1">
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                      <div>
                        <div>Export as CSV</div>
                        <div className="text-[10px] text-slate-500">Flattened spreadsheet</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div>Export as JSON</div>
                        <div className="text-[10px] text-slate-500">Structured data objects</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Add Research Record Button */}
              <Button
                onClick={handleOpenCreate}
                className="gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Research Record</span>
              </Button>
            </div>
          </div>

          {/* Privacy & Security UX Notice */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>
              Use research IDs or de-identified information whenever possible. Avoid entering unnecessary personally identifiable information.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Success / Error Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
              : "bg-rose-950/40 border-rose-800/50 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Search & Dynamic Filter Controls */}
      <div className="p-4 rounded-xl bg-[#0f1523] border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Research ID or value..."
            className="w-full bg-[#0b101d] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Categorical Field Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterableFields.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedFilterFieldKey}
                onChange={(e) => {
                  setSelectedFilterFieldKey(e.target.value);
                  setSelectedFilterValue("");
                }}
                className="text-xs bg-[#0b101d] border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
              >
                <option value="">Filter by variable...</option>
                {filterableFields.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>

              {selectedFilterFieldKey && currentFilterOptions.length > 0 && (
                <select
                  value={selectedFilterValue}
                  onChange={(e) => setSelectedFilterValue(e.target.value)}
                  className="text-xs bg-[#0b101d] border border-slate-800 text-teal-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-medium"
                >
                  <option value="">Select value...</option>
                  {currentFilterOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Records Table / Empty State */}
      {records.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-slate-800 bg-[#0f1523]/50">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-950/60 border border-teal-800/40 text-teal-400 flex items-center justify-center mx-auto">
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">
                No Research Records Collected Yet
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add case entries and observational responses using the published clinical protocol schema.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleOpenCreate}
                className="gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Research Record</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : filteredRecords.length === 0 ? (
        <Card className="p-8 text-center bg-[#0f1523]/50 border-slate-800">
          <p className="text-xs text-slate-400">
            No records matched your search or active filter criteria.
          </p>
          <button
            onClick={handleClearFilters}
            className="text-xs text-teal-400 hover:underline mt-2 inline-block"
          >
            Clear active filters
          </button>
        </Card>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-[#0f1523] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0b101d] text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-300">Research ID</th>
                  {allFields.slice(0, 4).map((f) => (
                    <th key={f.key} className="py-3 px-4 font-semibold text-slate-300 truncate max-w-[140px]">
                      {f.label}
                    </th>
                  ))}
                  <th className="py-3 px-4 font-semibold text-slate-300">Created Date</th>
                  <th className="py-3 px-4 text-right font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredRecords.map((rec) => {
                  const formattedDate = new Date(rec.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-teal-400">
                        {rec.research_id}
                      </td>

                      {allFields.slice(0, 4).map((f) => {
                        const val = rec.responses?.[f.key] ?? rec.responses?.[f.label];
                        const displayVal =
                          val === undefined || val === null || val === ""
                            ? "—"
                            : Array.isArray(val)
                            ? val.join(", ")
                            : typeof val === "boolean"
                            ? val
                              ? "Yes"
                              : "No"
                            : String(val);

                        return (
                          <td
                            key={f.key}
                            className="py-3 px-4 text-slate-300 truncate max-w-[150px]"
                            title={displayVal}
                          >
                            {displayVal}
                          </td>
                        );
                      })}

                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {formattedDate}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-950/40 transition-colors"
                            title="View Record Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD ENTRY MODAL (CREATE / EDIT) */}
      <RecordEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        schema={schema}
        studyId={studyId}
        existingRecord={activeRecord}
        generatedResearchId={nextResearchId}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* RECORD VIEW MODAL (READ-ONLY) */}
      <RecordViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        schema={schema}
        record={activeRecord}
        onEdit={(rec) => {
          setIsViewModalOpen(false);
          handleOpenEdit(rec);
        }}
      />
    </div>
  );
}
