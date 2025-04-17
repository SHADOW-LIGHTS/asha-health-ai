"use server";

import { experimental_transcribe as transcribe } from "ai";
import { deepgram } from "@ai-sdk/deepgram";

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
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

    return result.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}
