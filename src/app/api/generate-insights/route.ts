import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AIResearchInsightsResult, AggregatedDatasetSummary } from "@/components/analytics/types";
import fs from "fs";
import path from "path";

function getEnvConfig() {
  let apiKey = process.env.GEMINI_API_KEY;
  let model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const lines = envContent.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("GEMINI_API_KEY=")) {
          apiKey = trimmed.replace("GEMINI_API_KEY=", "").trim();
        } else if (trimmed.startsWith("GEMINI_MODEL=")) {
          model = trimmed.replace("GEMINI_MODEL=", "").trim();
        }
      }
    }
  } catch {
    // ignore
  }

  return {
    apiKey,
    model: model || "gemini-3.5-flash-lite",
  };
}

export async function POST(request: Request) {
  try {
    const { apiKey, model } = getEnvConfig();
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env.local." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const datasetSummary: AggregatedDatasetSummary = body.datasetSummary;

    if (!datasetSummary || !datasetSummary.total_records || datasetSummary.total_records === 0) {
      return NextResponse.json(
        { error: "Aggregated dataset summary is empty or contains no records." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert Clinical Biostatistician and Health Data Scientist analyzing aggregated clinical research statistics.
Your task is to review summary statistics for a research study and generate objective, cautious, research-oriented dataset insights.

CRITICAL CLINICAL & METHODOLOGICAL SAFETY RULES:
1. STRICT CAUTION: DO NOT diagnose patients, recommend clinical treatments, make clinical decisions, or claim causation.
2. NEVER state that one variable causes another. Always use cautious research language: "observed association", "dataset pattern", "may warrant further investigation", "correlated with" instead of "causes", "proves", "confirms".
3. Ground every observation strictly in the provided aggregated statistics. Do not speculate beyond the data provided.
4. Output STRICT JSON format only.

EXPECTED JSON SCHEMA:
{
  "summary": "Short, objective overview of the collected dataset and its general characteristics",
  "patterns": [
    {
      "title": "Clear concise pattern title",
      "description": "Description grounded strictly in the provided statistics",
      "evidence": "Specific relevant statistic or percentage (e.g. 64% of cohort, mean 128.4 mmHg)"
    }
  ],
  "data_quality": [
    {
      "issue": "Missingness or data collection observation",
      "description": "Exploration of missing fields or completeness patterns"
    }
  ],
  "potential_relationships": [
    {
      "variables": ["Variable A", "Variable B"],
      "observation": "Observed exploratory association or difference in grouped means",
      "evidence": "Specific statistical comparison from dataset"
    }
  ],
  "outliers": [
    {
      "variable": "Variable name",
      "observation": "Unusual range, wide standard deviation, or boundary value noted in the summary"
    }
  ],
  "research_questions": [
    "Cautious research question suggested by the observed dataset patterns for subsequent investigation"
  ]
}`;

    const userPrompt = `Analyze the following aggregated clinical dataset statistics:

STUDY CONTEXT:
- Title: ${datasetSummary.study_title}
- Research Objective: ${datasetSummary.research_objective}
- Total Records: ${datasetSummary.total_records}
- Total Variables: ${datasetSummary.total_variables}
- Overall Completeness: ${datasetSummary.overall_completeness_percentage}%

AGGREGATED VARIABLES SUMMARY:
${JSON.stringify(datasetSummary.variables, null, 2)}

${
  datasetSummary.key_bivariate_observations &&
  datasetSummary.key_bivariate_observations.length > 0
    ? `CALCULATED CROSS-VARIABLE OBSERVATIONS:
${JSON.stringify(datasetSummary.key_bivariate_observations, null, 2)}`
    : ""
}

Generate the cautious, evidence-grounded AI Research Insights JSON.`;

    const ai = new GoogleGenAI({ apiKey });

    const modelsToTry = [
      model,
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-2.0-flash-lite",
    ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    let responseText = "";
    let lastError: any = null;

    for (const currentModel of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text?.trim()) {
          responseText = response.text.trim();
          break;
        }
      } catch (genErr: any) {
        lastError = genErr;
        console.warn(`Model ${currentModel} failed for insights, trying fallback:`, genErr?.message || genErr);
      }
    }

    if (!responseText) {
      throw lastError || new Error("Gemini returned an empty response.");
    }

    let parsedInsights: AIResearchInsightsResult;
    try {
      parsedInsights = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini Insights output:", responseText);
      throw new Error("Gemini response could not be parsed as valid JSON.");
    }

    // Ensure fallback arrays exist
    const normalizedInsights: AIResearchInsightsResult = {
      summary: parsedInsights.summary || "Summary of collected clinical dataset.",
      patterns: Array.isArray(parsedInsights.patterns) ? parsedInsights.patterns : [],
      data_quality: Array.isArray(parsedInsights.data_quality) ? parsedInsights.data_quality : [],
      potential_relationships: Array.isArray(parsedInsights.potential_relationships)
        ? parsedInsights.potential_relationships
        : [],
      outliers: Array.isArray(parsedInsights.outliers) ? parsedInsights.outliers : [],
      research_questions: Array.isArray(parsedInsights.research_questions)
        ? parsedInsights.research_questions
        : [],
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      insights: normalizedInsights,
    });
  } catch (err: any) {
    console.error("AI Research Insights Error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Failed to generate AI research insights. Please try again.",
      },
      { status: 500 }
    );
  }
}
