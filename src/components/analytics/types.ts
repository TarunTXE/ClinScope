import { FormField, FormSection, FormSchema, ResearchRecord } from "@/lib/supabase/types";

export type InferredVariableType = "numeric" | "categorical" | "boolean" | "date" | "text";

export interface NumericStats {
  count: number;
  missingCount: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  histogram: Array<{
    binLabel: string;
    binStart: number;
    binEnd: number;
    count: number;
  }>;
}

export interface CategoricalFrequency {
  name: string;
  count: number;
  percentage: number;
}

export interface CategoricalStats {
  totalCount: number;
  validCount: number;
  missingCount: number;
  frequencies: CategoricalFrequency[];
}

export interface DateStats {
  count: number;
  missingCount: number;
  minDate: string | null;
  maxDate: string | null;
  distributionByMonth: Array<{
    month: string;
    count: number;
  }>;
}

export interface AnalyzedVariable {
  key: string;
  label: string;
  sectionTitle: string;
  rawType: string;
  inferredType: InferredVariableType;
  required: boolean;
  totalRecords: number;
  validCount: number;
  missingCount: number;
  completionPercentage: number;
  missingPercentage: number;
  numericStats?: NumericStats;
  categoricalStats?: CategoricalStats;
  dateStats?: DateStats;
  sampleValues: any[];
}

export interface StudyAnalyticsOverview {
  totalRecords: number;
  totalVariables: number;
  totalMissingCells: number;
  totalPossibleCells: number;
  overallCompletionRate: number;
  numericVariablesCount: number;
  categoricalVariablesCount: number;
  booleanVariablesCount: number;
  dateVariablesCount: number;
  textVariablesCount: number;
  highMissingnessCount: number; // Variables with > 30% missing
}

export interface AIInsightPattern {
  title: string;
  description: string;
  evidence: string;
}

export interface AIInsightDataQuality {
  issue: string;
  description: string;
}

export interface AIInsightRelationship {
  variables: string[];
  observation: string;
  evidence: string;
}

export interface AIInsightOutlier {
  variable: string;
  observation: string;
}

export interface AIResearchInsightsResult {
  summary: string;
  patterns: AIInsightPattern[];
  data_quality: AIInsightDataQuality[];
  potential_relationships: AIInsightRelationship[];
  outliers: AIInsightOutlier[];
  research_questions: string[];
  generated_at?: string;
}

export interface AggregatedDatasetSummary {
  study_title: string;
  research_objective: string;
  total_records: number;
  total_variables: number;
  overall_completeness_percentage: number;
  variables: Array<{
    name: string;
    section: string;
    type: string;
    missing_count: number;
    missing_percentage: number;
    numeric_stats?: {
      min: number;
      max: number;
      mean: number;
      median: number;
      std_dev: number;
    };
    categorical_distribution?: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  }>;
  key_bivariate_observations?: Array<{
    variable_a: string;
    variable_b: string;
    type: string;
    summary: string;
  }>;
}

