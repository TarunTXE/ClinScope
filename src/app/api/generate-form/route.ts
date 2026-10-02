import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { FormSchema, FormSection, FormField, FieldType } from "@/lib/supabase/types";

import fs from "fs";
import path from "path";

const VALID_FIELD_TYPES: FieldType[] = [
  "text",
  "textarea",
  "number",
  "date",
  "select",
  "radio",
  "checkbox",
  "boolean",
];

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
      studyTitle = "",
      researchObjective = "",
      researchDomain = "",
      additionalInstructions = "",
    } = body;

    if (!researchObjective && !studyTitle) {
      return NextResponse.json(
        { error: "Study title or research objective is required to generate a form." },
        { status: 400 }
      );
    }

    // Safety and System Prompt
    const systemPrompt = `You are an expert Clinical Data Manager and Clinical Research Specialist.
Your task is to generate a structured clinical research data collection form schema based on the specified clinical research objective and domain.

CRITICAL CLINICAL & SAFETY GUIDELINES:
1. Generate data-collection fields appropriate to the research objective and domain (e.g., patient demographics, baseline vitals, lab biomarkers, inclusion/exclusion criteria, symptom severity scales, observational follow-up metrics).
2. DO NOT output medical diagnoses, clinical treatment recommendations, or clinical conclusions.
3. DO NOT request real patient identifying information (PII) beyond research age/gender/cohort IDs.
4. Output STRICT JSON format only.

SCHEMA STRUCTURE:
{
  "title": "Professional Title for the Research Form",
  "description": "Brief description of the research form's purpose",
  "sections": [
    {
      "title": "Section Name (e.g. Demographics, Baseline Clinical Vitals, Laboratory Biomarkers, Observational Endpoints)",
      "description": "Optional section guidance",
      "fields": [
        {
          "label": "Field Label (e.g. Age, Systolic Blood Pressure, Serum Creatinine)",
          "type": "number" | "text" | "textarea" | "date" | "select" | "radio" | "checkbox" | "boolean",
          "required": true | false,
          "options": ["Option 1", "Option 2"],
          "placeholder": "e.g. mmHg, mg/dL, or guidance",
          "description": "Short field note if needed"
        }
      ]
    }
  ]
}

Supported field types:
- number: for numeric metrics, lab values, dosages, ages.
- text: for short text entries, codes.
- textarea: for qualitative clinical notes or medical history notes.
- date: for dates of examination, symptom onset, procedure dates.
- select: for single dropdown choices (options array required).
- radio: for single radio choices (options array required).
- checkbox: for multi-select options (options array required).
- boolean: for Yes / No indicators.

For select, radio, and multi-choice checkbox fields, always provide realistic medical options (e.g. ["Mild", "Moderate", "Severe"]).`;

    const userPrompt = `Generate a comprehensive clinical research form for:
- Study Title: ${studyTitle || "Clinical Observational Study"}
- Research Objective: ${researchObjective}
- Research Domain / Medical Field: ${researchDomain || "General Clinical Medicine"}
${additionalInstructions ? `- Additional Custom Instructions: ${additionalInstructions}` : ""}

Ensure the form contains 2 to 4 well-structured sections with 3 to 6 relevant research fields in each section. Return only the JSON object.`;

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
        console.warn(`Model ${currentModel} failed, trying fallback:`, genErr?.message || genErr);
      }
    }

    if (!responseText) {
      throw lastError || new Error("Gemini returned an empty response.");
    }

    let parsedSchema: FormSchema;
    try {
      parsedSchema = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON output:", responseText);
      throw new Error("Gemini response could not be parsed as valid JSON.");
    }

    // Normalize schema with unique IDs and clean fallback defaults
    const normalizedSections: FormSection[] = (parsedSchema.sections || []).map(
      (section, sIdx) => {
        const sectionId = section.id || `sec_${Date.now()}_${sIdx}_${Math.random().toString(36).substring(2, 7)}`;
        const fields: FormField[] = (section.fields || []).map((field, fIdx) => {
          const fieldId = field.id || `fld_${Date.now()}_${sIdx}_${fIdx}_${Math.random().toString(36).substring(2, 7)}`;
          const fieldType = VALID_FIELD_TYPES.includes(field.type) ? field.type : "text";

          return {
            id: fieldId,
            label: field.label || `Field ${fIdx + 1}`,
            type: fieldType,
            required: typeof field.required === "boolean" ? field.required : false,
            options: Array.isArray(field.options) ? field.options : [],
            placeholder: field.placeholder || "",
            description: field.description || "",
          };
        });

        return {
          id: sectionId,
          title: section.title || `Section ${sIdx + 1}`,
          description: section.description || "",
          fields,
        };
      }
    );

    const finalizedForm: FormSchema = {
      title: parsedSchema.title || studyTitle || "Research Data Collection Form",
      description: parsedSchema.description || `Clinical research form for ${studyTitle}`,
      sections: normalizedSections,
    };

    return NextResponse.json({
      success: true,
      schema: finalizedForm,
    });
  } catch (err: any) {
    console.error("AI Form Generation Error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Failed to generate clinical research form with Gemini. Please try again.",
      },
      { status: 500 }
    );
  }
}
