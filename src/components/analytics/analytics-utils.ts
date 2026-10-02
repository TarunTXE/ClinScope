import { FormField, FormSchema, ResearchRecord } from "@/lib/supabase/types";
import {
  AnalyzedVariable,
  InferredVariableType,
  NumericStats,
  CategoricalStats,
  DateStats,
  StudyAnalyticsOverview,
  AggregatedDatasetSummary,
} from "./types";

/**
 * Safely extracts the value for a given field from a research record.
 * Handles key variations (field.id, field.label, lowercase matching).
 */
export function getFieldValue(record: ResearchRecord, field: FormField): any {
  if (!record || !record.responses) return undefined;

  const responses = record.responses;

  // 1. Direct match with field.id
  if (field.id && responses[field.id] !== undefined) {
    return responses[field.id];
  }

  // 2. Direct match with field.label
  if (field.label && responses[field.label] !== undefined) {
    return responses[field.label];
  }

  // 3. Normalized case-insensitive lookup
  const normalizedLabel = (field.label || "").trim().toLowerCase();
  const normalizedId = (field.id || "").trim().toLowerCase();

  for (const key of Object.keys(responses)) {
    const k = key.trim().toLowerCase();
    if (k === normalizedLabel || k === normalizedId) {
      return responses[key];
    }
  }

  return undefined;
}

/**
 * Checks if a value is considered missing/empty in clinical research context.
 */
export function isValueMissing(val: any): boolean {
  if (val === undefined || val === null) return true;
  if (typeof val === "string" && val.trim() === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === "number" && isNaN(val)) return true;
  return false;
}

/**
 * Infers variable type based on schema definition and collected data.
 */
export function inferFieldType(field: FormField, values: any[]): InferredVariableType {
  const schemaType = (field.type || "").toLowerCase();

  if (schemaType === "number") return "numeric";
  if (schemaType === "date") return "date";
  if (schemaType === "boolean") return "boolean";
  if (schemaType === "select" || schemaType === "radio" || schemaType === "checkbox") {
    return "categorical";
  }

  // If text or textarea, check if collected non-empty values are consistently numbers
  const nonMissing = values.filter((v) => !isValueMissing(v));
  if (nonMissing.length > 0) {
    const allNumeric = nonMissing.every((v) => {
      if (typeof v === "number") return true;
      if (typeof v === "string") {
        const trimmed = v.trim();
        return trimmed !== "" && !isNaN(Number(trimmed));
      }
      return false;
    });

    if (allNumeric) return "numeric";

    // If boolean-like ("yes"/"no", "true"/"false")
    const allBoolean = nonMissing.every((v) => {
      const str = String(v).toLowerCase().trim();
      return str === "yes" || str === "no" || str === "true" || str === "false";
    });
    if (allBoolean) return "boolean";
  }

  return schemaType === "textarea" ? "text" : "text";
}

/**
 * Computes standard descriptive statistics for numeric variables.
 */
export function computeNumericStats(
  values: number[],
  totalRecords: number,
  missingCount: number
): NumericStats {
  if (values.length === 0) {
    return {
      count: 0,
      missingCount,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      histogram: [],
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const min = sorted[0];
  const max = sorted[count - 1];

  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = Number((sum / count).toFixed(2));

  let median: number;
  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    median = Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  } else {
    median = Number(sorted[mid].toFixed(2));
  }

  let stdDev = 0;
  if (count > 1) {
    const variance =
      sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (count - 1);
    stdDev = Number(Math.sqrt(variance).toFixed(2));
  }

  // Generate Histogram Bins
  const histogram: NumericStats["histogram"] = [];
  if (min === max) {
    histogram.push({
      binLabel: `${min}`,
      binStart: min,
      binEnd: max,
      count,
    });
  } else {
    // Determine reasonable bin count (between 4 and 8)
    const numBins = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(count))));
    const binWidth = (max - min) / numBins;

    for (let i = 0; i < numBins; i++) {
      const binStart = Number((min + i * binWidth).toFixed(2));
      const binEnd =
        i === numBins - 1
          ? Number(max.toFixed(2))
          : Number((min + (i + 1) * binWidth).toFixed(2));

      const binCount = sorted.filter((v) => {
        if (i === numBins - 1) {
          return v >= binStart && v <= binEnd;
        }
        return v >= binStart && v < binEnd;
      }).length;

      histogram.push({
        binLabel: `${binStart} - ${binEnd}`,
        binStart,
        binEnd,
        count: binCount,
      });
    }
  }

  return {
    count,
    missingCount,
    min,
    max,
    mean,
    median,
    stdDev,
    histogram,
  };
}

/**
 * Computes frequency distribution and percentages for categorical & boolean variables.
 */
export function computeCategoricalStats(
  rawValues: any[],
  totalRecords: number,
  missingCount: number
): CategoricalStats {
  const freqMap = new Map<string, number>();
  let validCount = 0;

  for (const item of rawValues) {
    if (isValueMissing(item)) continue;

    if (Array.isArray(item)) {
      // For multi-select checkbox arrays
      for (const subItem of item) {
        if (!isValueMissing(subItem)) {
          const strVal = String(subItem).trim();
          freqMap.set(strVal, (freqMap.get(strVal) || 0) + 1);
          validCount++;
        }
      }
    } else if (typeof item === "boolean") {
      const strVal = item ? "Yes / True" : "No / False";
      freqMap.set(strVal, (freqMap.get(strVal) || 0) + 1);
      validCount++;
    } else {
      const strVal = String(item).trim();
      freqMap.set(strVal, (freqMap.get(strVal) || 0) + 1);
      validCount++;
    }
  }

  const frequencies = Array.from(freqMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: validCount > 0 ? Number(((count / validCount) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalCount: totalRecords,
    validCount,
    missingCount,
    frequencies,
  };
}

/**
 * Computes date distribution metrics.
 */
export function computeDateStats(
  rawValues: any[],
  missingCount: number
): DateStats {
  const validDates: Date[] = [];
  const monthMap = new Map<string, number>();

  for (const item of rawValues) {
    if (isValueMissing(item)) continue;
    const d = new Date(item);
    if (!isNaN(d.getTime())) {
      validDates.push(d);
      const monthKey = d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    }
  }

  if (validDates.length === 0) {
    return {
      count: 0,
      missingCount,
      minDate: null,
      maxDate: null,
      distributionByMonth: [],
    };
  }

  validDates.sort((a, b) => a.getTime() - b.getTime());

  const distributionByMonth = Array.from(monthMap.entries()).map(([month, count]) => ({
    month,
    count,
  }));

  return {
    count: validDates.length,
    missingCount,
    minDate: validDates[0].toISOString().split("T")[0],
    maxDate: validDates[validDates.length - 1].toISOString().split("T")[0],
    distributionByMonth,
  };
}

/**
 * Analyzes the entire dataset against the schema.
 */
export function analyzeDataset(
  schema: FormSchema | null,
  records: ResearchRecord[]
): {
  overview: StudyAnalyticsOverview;
  variables: AnalyzedVariable[];
} {
  const totalRecords = records.length;
  const variables: AnalyzedVariable[] = [];

  if (!schema || !schema.sections) {
    return {
      overview: {
        totalRecords,
        totalVariables: 0,
        totalMissingCells: 0,
        totalPossibleCells: 0,
        overallCompletionRate: 0,
        numericVariablesCount: 0,
        categoricalVariablesCount: 0,
        booleanVariablesCount: 0,
        dateVariablesCount: 0,
        textVariablesCount: 0,
        highMissingnessCount: 0,
      },
      variables: [],
    };
  }

  let totalMissingCells = 0;
  let totalPossibleCells = 0;

  for (const section of schema.sections) {
    for (const field of section.fields || []) {
      const fieldKey = field.id || field.label;
      const values = records.map((rec) => getFieldValue(rec, field));
      const inferredType = inferFieldType(field, values);

      let validCount = 0;
      let missingCount = 0;
      const validNumericValues: number[] = [];

      for (const val of values) {
        if (isValueMissing(val)) {
          missingCount++;
        } else {
          validCount++;
          if (inferredType === "numeric") {
            const num = Number(val);
            if (!isNaN(num)) {
              validNumericValues.push(num);
            }
          }
        }
      }

      totalMissingCells += missingCount;
      totalPossibleCells += totalRecords;

      const completionPercentage =
        totalRecords > 0 ? Number(((validCount / totalRecords) * 100).toFixed(1)) : 0;
      const missingPercentage =
        totalRecords > 0 ? Number(((missingCount / totalRecords) * 100).toFixed(1)) : 0;

      const analyzedVar: AnalyzedVariable = {
        key: fieldKey,
        label: field.label,
        sectionTitle: section.title,
        rawType: field.type,
        inferredType,
        required: Boolean(field.required),
        totalRecords,
        validCount,
        missingCount,
        completionPercentage,
        missingPercentage,
        sampleValues: values.filter((v) => !isValueMissing(v)).slice(0, 5),
      };

      if (inferredType === "numeric") {
        analyzedVar.numericStats = computeNumericStats(
          validNumericValues,
          totalRecords,
          missingCount
        );
      } else if (
        inferredType === "categorical" ||
        inferredType === "boolean" ||
        (inferredType === "text" && field.options && field.options.length > 0)
      ) {
        analyzedVar.categoricalStats = computeCategoricalStats(
          values,
          totalRecords,
          missingCount
        );
      } else if (inferredType === "date") {
        analyzedVar.dateStats = computeDateStats(values, missingCount);
      }

      variables.push(analyzedVar);
    }
  }

  const numericCount = variables.filter((v) => v.inferredType === "numeric").length;
  const categoricalCount = variables.filter(
    (v) => v.inferredType === "categorical" || v.inferredType === "boolean"
  ).length;
  const booleanCount = variables.filter((v) => v.inferredType === "boolean").length;
  const dateCount = variables.filter((v) => v.inferredType === "date").length;
  const textCount = variables.filter((v) => v.inferredType === "text").length;
  const highMissingnessCount = variables.filter((v) => v.missingPercentage > 30).length;

  const overallCompletionRate =
    totalPossibleCells > 0
      ? Number(
          (
            ((totalPossibleCells - totalMissingCells) / totalPossibleCells) *
            100
          ).toFixed(1)
        )
      : 0;

  return {
    overview: {
      totalRecords,
      totalVariables: variables.length,
      totalMissingCells,
      totalPossibleCells,
      overallCompletionRate,
      numericVariablesCount: numericCount,
      categoricalVariablesCount: categoricalCount,
      booleanVariablesCount: booleanCount,
      dateVariablesCount: dateCount,
      textVariablesCount: textCount,
      highMissingnessCount,
    },
    variables,
  };
}

/**
 * Cross-variable comparison analysis.
 */
export function compareVariables(
  varA: AnalyzedVariable,
  varB: AnalyzedVariable,
  schema: FormSchema,
  records: ResearchRecord[]
) {
  // Find fields in schema
  let fieldA: FormField | undefined;
  let fieldB: FormField | undefined;

  for (const section of schema.sections || []) {
    for (const field of section.fields || []) {
      const key = field.id || field.label;
      if (key === varA.key || field.label === varA.label) fieldA = field;
      if (key === varB.key || field.label === varB.label) fieldB = field;
    }
  }

  if (!fieldA || !fieldB) return null;

  const pairs: Array<{ valA: any; valB: any; recordId: string }> = [];

  for (const rec of records) {
    const rawA = getFieldValue(rec, fieldA);
    const rawB = getFieldValue(rec, fieldB);

    if (!isValueMissing(rawA) && !isValueMissing(rawB)) {
      pairs.push({
        valA: rawA,
        valB: rawB,
        recordId: rec.research_id || "Record",
      });
    }
  }

  // 1. Numeric vs Numeric -> Scatter Data
  if (varA.inferredType === "numeric" && varB.inferredType === "numeric") {
    const scatterData = pairs
      .map((p) => ({
        x: Number(p.valA),
        y: Number(p.valB),
        recordId: p.recordId,
      }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));

    return {
      type: "numeric-vs-numeric" as const,
      data: scatterData,
      xLabel: varA.label,
      yLabel: varB.label,
      sampleSize: scatterData.length,
    };
  }

  // 2. Categorical vs Numeric -> Grouped Summary
  if (
    (varA.inferredType === "categorical" || varA.inferredType === "boolean") &&
    varB.inferredType === "numeric"
  ) {
    const groupMap = new Map<string, number[]>();

    for (const p of pairs) {
      const catKey = String(p.valA);
      const numVal = Number(p.valB);
      if (!isNaN(numVal)) {
        if (!groupMap.has(catKey)) groupMap.set(catKey, []);
        groupMap.get(catKey)!.push(numVal);
      }
    }

    const groupData = Array.from(groupMap.entries()).map(([cat, nums]) => {
      const sum = nums.reduce((acc, n) => acc + n, 0);
      const mean = Number((sum / nums.length).toFixed(2));
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      return {
        category: cat,
        count: nums.length,
        mean,
        min,
        max,
      };
    });

    return {
      type: "categorical-vs-numeric" as const,
      data: groupData,
      catLabel: varA.label,
      numLabel: varB.label,
      sampleSize: pairs.length,
    };
  }

  // 3. Numeric vs Categorical -> Same grouped summary inverted
  if (
    varA.inferredType === "numeric" &&
    (varB.inferredType === "categorical" || varB.inferredType === "boolean")
  ) {
    const groupMap = new Map<string, number[]>();

    for (const p of pairs) {
      const catKey = String(p.valB);
      const numVal = Number(p.valA);
      if (!isNaN(numVal)) {
        if (!groupMap.has(catKey)) groupMap.set(catKey, []);
        groupMap.get(catKey)!.push(numVal);
      }
    }

    const groupData = Array.from(groupMap.entries()).map(([cat, nums]) => {
      const sum = nums.reduce((acc, n) => acc + n, 0);
      const mean = Number((sum / nums.length).toFixed(2));
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      return {
        category: cat,
        count: nums.length,
        mean,
        min,
        max,
      };
    });

    return {
      type: "categorical-vs-numeric" as const,
      data: groupData,
      catLabel: varB.label,
      numLabel: varA.label,
      sampleSize: pairs.length,
    };
  }

  // 4. Categorical vs Categorical -> Cross Tabulation / Grouped Bar
  if (
    (varA.inferredType === "categorical" || varA.inferredType === "boolean" || varA.inferredType === "text") &&
    (varB.inferredType === "categorical" || varB.inferredType === "boolean" || varB.inferredType === "text")
  ) {
    const crossMap = new Map<string, Map<string, number>>();
    const allVarBValues = new Set<string>();

    for (const p of pairs) {
      const valAStr = String(p.valA).trim();
      const valBStr = String(p.valB).trim();
      allVarBValues.add(valBStr);

      if (!crossMap.has(valAStr)) {
        crossMap.set(valAStr, new Map());
      }
      const bMap = crossMap.get(valAStr)!;
      bMap.set(valBStr, (bMap.get(valBStr) || 0) + 1);
    }

    const bKeys = Array.from(allVarBValues);
    const tableData = Array.from(crossMap.entries()).map(([catA, bMap]) => {
      const row: Record<string, any> = { categoryA: catA };
      let total = 0;
      for (const bKey of bKeys) {
        const count = bMap.get(bKey) || 0;
        row[bKey] = count;
        total += count;
      }
      row.total = total;
      return row;
    });

    return {
      type: "categorical-vs-categorical" as const,
      data: tableData,
      keysB: bKeys,
      catALabel: varA.label,
      catBLabel: varB.label,
      sampleSize: pairs.length,
    };
  }

  return null;
}

/**
 * Builds a strictly aggregated summary of the dataset suitable for secure Gemini analysis.
 * NEVER includes patient identifiers, individual row values, or PII.
 */
export function buildAggregatedDatasetSummary(
  studyTitle: string,
  researchObjective: string,
  overview: StudyAnalyticsOverview,
  variables: AnalyzedVariable[],
  schema: FormSchema,
  records: ResearchRecord[]
): AggregatedDatasetSummary {
  const summarizedVariables = variables.map((v) => {
    const varSummary: AggregatedDatasetSummary["variables"][0] = {
      name: v.label,
      section: v.sectionTitle,
      type: v.inferredType,
      missing_count: v.missingCount,
      missing_percentage: v.missingPercentage,
    };

    if (v.inferredType === "numeric" && v.numericStats && v.numericStats.count > 0) {
      varSummary.numeric_stats = {
        min: v.numericStats.min,
        max: v.numericStats.max,
        mean: v.numericStats.mean,
        median: v.numericStats.median,
        std_dev: v.numericStats.stdDev,
      };
    }

    if (
      (v.inferredType === "categorical" || v.inferredType === "boolean" || v.inferredType === "text") &&
      v.categoricalStats &&
      v.categoricalStats.frequencies.length > 0
    ) {
      varSummary.categorical_distribution = v.categoricalStats.frequencies.map((f) => ({
        category: f.name,
        count: f.count,
        percentage: f.percentage,
      }));
    }

    return varSummary;
  });

  // Calculate high-level bivariate relationships for key variable pairs
  const keyBivariateObservations: AggregatedDatasetSummary["key_bivariate_observations"] = [];

  const categoricalVars = variables.filter(
    (v) => (v.inferredType === "categorical" || v.inferredType === "boolean") && v.validCount > 0
  );
  const numericVars = variables.filter(
    (v) => v.inferredType === "numeric" && v.validCount > 0
  );

  // Grouped comparisons: Categorical vs Numeric
  for (const catVar of categoricalVars.slice(0, 3)) {
    for (const numVar of numericVars.slice(0, 3)) {
      const comp = compareVariables(catVar, numVar, schema, records);
      if (comp && comp.type === "categorical-vs-numeric" && comp.data.length > 1) {
        const groupDetails = comp.data
          .map((g: any) => `${g.category} (mean ${g.mean}, n=${g.count})`)
          .join("; ");

        keyBivariateObservations.push({
          variable_a: catVar.label,
          variable_b: numVar.label,
          type: "categorical_vs_numeric_grouping",
          summary: `Grouped mean of ${numVar.label} across ${catVar.label} levels: ${groupDetails}`,
        });
      }
    }
  }

  // Cross-tabulations: Categorical vs Categorical
  if (categoricalVars.length >= 2) {
    const comp = compareVariables(categoricalVars[0], categoricalVars[1], schema, records);
    if (comp && comp.type === "categorical-vs-categorical" && comp.data.length > 0) {
      const details = comp.data
        .map((row: any) => `${row.categoryA} (total=${row.total})`)
        .join("; ");
      keyBivariateObservations.push({
        variable_a: categoricalVars[0].label,
        variable_b: categoricalVars[1].label,
        type: "cross_tabulation",
        summary: `Distribution of ${categoricalVars[1].label} across ${categoricalVars[0].label}: ${details}`,
      });
    }
  }

  return {
    study_title: studyTitle || "Clinical Observational Study",
    research_objective: researchObjective || "Observational analysis",
    total_records: overview.totalRecords,
    total_variables: overview.totalVariables,
    overall_completeness_percentage: overview.overallCompletionRate,
    variables: summarizedVariables,
    key_bivariate_observations: keyBivariateObservations.slice(0, 8),
  };
}

