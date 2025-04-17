"use server";

import { experimental_transcribe as transcribe } from "ai";
import { deepgram } from "@ai-sdk/deepgram";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error("No audio data provided");
  }

  try {
    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Transcribe using Deepgram
    const result = await transcribe({
      model: deepgram.transcription("nova-3"),
      audio: new Uint8Array(arrayBuffer),
      providerOptions: {
        deepgram: {
          smartFormat: true,
          punctuate: true,
          paragraphs: true,
          diarize: true,
        },
      },
    });

    // Check for empty transcript in Deepgram response
    if (!result?.text || result.text.trim() === "") {
      return "No speech detected";
    }

    return result.text;
  } catch (error) {
    console.error("Transcription error:", error);
    // Return "No speech detected" for both server errors and transcription failures
    return "No speech detected";
  }
}
