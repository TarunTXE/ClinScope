import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AggregatedDatasetSummary } from "@/components/analytics/types";
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
    const {
      datasetSummary,
      question,
    }: { datasetSummary: AggregatedDatasetSummary; question: string } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "A question about the dataset is required." },
        { status: 400 }
      );
    }

    if (!datasetSummary || !datasetSummary.total_records || datasetSummary.total_records === 0) {
      return NextResponse.json(
        { error: "Aggregated dataset summary is empty." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert Clinical Biostatistician assistant answering questions from a researcher doctor about their collected study dataset.
You are given aggregated statistical summaries of the study.

CRITICAL CLINICAL & METHODOLOGICAL SAFETY RULES:
1. Answer strictly based on the aggregated statistics provided.
2. DO NOT make clinical diagnoses, recommend medications or treatments, or make medical causal claims.
3. Use cautious research language: "In this dataset...", "The recorded mean is...", "An observed pattern indicates...", "Data shows...".
4. Keep the response concise, clear, and direct (1 to 3 short paragraphs).
5. If the aggregated statistics do not contain information needed to answer the question, clearly state that the current dataset summary does not capture that specific detail.`;

    const userPrompt = `RESEARCH STUDY AGGREGATED STATISTICS:
- Title: ${datasetSummary.study_title}
- Objective: ${datasetSummary.research_objective}
- Total Records: ${datasetSummary.total_records}
- Total Variables: ${datasetSummary.total_variables}
- Overall Completeness: ${datasetSummary.overall_completeness_percentage}%

VARIABLES SUMMARY:
${JSON.stringify(datasetSummary.variables, null, 2)}

${
  datasetSummary.key_bivariate_observations &&
  datasetSummary.key_bivariate_observations.length > 0
    ? `KEY CROSS-VARIABLE CALCULATIONS:
${JSON.stringify(datasetSummary.key_bivariate_observations, null, 2)}`
    : ""
}

RESEARCHER'S QUESTION:
"${question.trim()}"

Provide a direct, concise, cautious answer strictly referencing the statistics above.`;

    const ai = new GoogleGenAI({ apiKey });

    const modelsToTry = [
      model,
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-2.0-flash-lite",
    ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    let answerText = "";
    let lastError: any = null;

    for (const currentModel of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: `${systemPrompt}\n\n${userPrompt}`,
        });

        if (response.text?.trim()) {
          answerText = response.text.trim();
          break;
        }
      } catch (genErr: any) {
        lastError = genErr;
        console.warn(`Model ${currentModel} failed for ask-dataset, trying fallback:`, genErr?.message || genErr);
      }
    }

    if (!answerText) {
      throw lastError || new Error("Gemini returned an empty response.");
    }

    return NextResponse.json({
      success: true,
      answer: answerText,
    });
  } catch (err: any) {
    console.error("Ask Dataset Error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Failed to process dataset inquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}
