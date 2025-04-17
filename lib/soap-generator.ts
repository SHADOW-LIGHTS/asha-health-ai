"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

type SoapNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
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

Based on the following transcription of a doctor-patient visit, create a detailed SOAP note.

Transcription:
${transcription}

Return ONLY a valid JSON object with the following structure, without any markdown formatting, code blocks, or additional text:
{
  "subjective": "Patient's description of symptoms and concerns",
  "objective": "Doctor's observations, vital signs, examination findings",
  "assessment": "Doctor's diagnosis or impression",
  "plan": "Treatment plan, medications, follow-up instructions"
}

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
      subjective: "Error generating subjective section. Please try again.",
      objective: "Error generating objective section. Please try again.",
      assessment: "Error generating assessment section. Please try again.",
      plan: "Error generating plan section. Please try again.",
    };
  }
}
