"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

type SoapNote = {
  subjective: { text: string; sources: string[] };
  objective: { text: string; sources: string[] };
  assessment: { text: string; sources: string[] };
  plan: { text: string; sources: string[] };
};

// Helper function to extract JSON from the response
function extractJsonFromText(text: string): string {
  // Remove markdown code block syntax if present
  const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
  const match = text.match(jsonRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // If no code blocks found, return the original text
  return text.trim();
}

export async function generateSoapNote(
  transcription: string
): Promise<SoapNote> {
  try {
    const prompt = `
You are a medical assistant AI that helps doctors create SOAP notes from transcriptions of doctor-patient visits.

Based on the following transcription of a doctor-patient visit, create a detailed SOAP note with source references.

Transcription:
${transcription}

Return ONLY a valid JSON object with the following structure, without any markdown formatting, code blocks, or additional text:
{
  "subjective": {
    "text": "Patient's description of symptoms and concerns",
    "sources": ["excerpts from transcript that support this section"]
  },
  "objective": {
    "text": "Doctor's observations, vital signs, examination findings",
    "sources": ["excerpts from transcript that support this section"]
  },
  "assessment": {
    "text": "Doctor's diagnosis or impression",
    "sources": ["excerpts from transcript that support this section"]
  },
  "plan": {
    "text": "Treatment plan, medications, follow-up instructions",
    "sources": ["excerpts from transcript that support this section"]
  }
}

For each section, include 1-3 key excerpts from the transcript that directly support the content.
Make sure each section is comprehensive and follows medical documentation standards.
`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.2,
    });

    // Extract JSON from the response and parse it
    const jsonText = extractJsonFromText(text);

    try {
      const soapNote = JSON.parse(jsonText) as SoapNote;

      // Validate the structure
      if (
        !soapNote.subjective ||
        !soapNote.objective ||
        !soapNote.assessment ||
        !soapNote.plan
      ) {
        throw new Error("Invalid SOAP note structure");
      }

      return soapNote;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Raw text:", jsonText);
      throw new Error("Failed to parse SOAP note JSON");
    }
  } catch (error) {
    console.error("SOAP note generation error:", error);
    // Return a fallback SOAP note with error messages
    return {
      subjective: {
        text: "Error generating subjective section. Please try again.",
        sources: [],
      },
      objective: {
        text: "Error generating objective section. Please try again.",
        sources: [],
      },
      assessment: {
        text: "Error generating assessment section. Please try again.",
        sources: [],
      },
      plan: {
        text: "Error generating plan section. Please try again.",
        sources: [],
      },
    };
  }
}
