"use client";

import { useState, useRef } from "react";
import { transcribeAudio } from "@/lib/transcription";
import { generateSoapNote } from "@/lib/soap-generator";
import { RecordingCard } from "@/components/recording/recording-card";
import { ResultsTabs } from "@/components/recording/results-tabs";

export default function RecordingInterface() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isChunking, setIsChunking] = useState(false);
  const [totalChunks, setTotalChunks] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [soapNote, setSoapNote] = useState<{
    subjective: { text: string; sources: string[] };
    objective: { text: string; sources: string[] };
    assessment: { text: string; sources: string[] };
    plan: { text: string; sources: string[] };
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 32000,
      });

      mediaRecorderRef.current = mediaRecorder;

      // Request data every 5 seconds to handle long recordings
      // const [isChunking, setIsChunking] = useState(false);
      // const [totalChunks, setTotalChunks] = useState(0);

      const processRecording = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (audioBlob.size === 0) {
          setError(
            "No speech detected. Please speak clearly during the recording or check your microphone permissions."
          );
          return;
        }

        setAudioBlob(audioBlob);
        setIsProcessing(true);
        setError(null);

        try {
          const transcriptionText = await transcribeAudio(audioBlob);
          setTranscription(transcriptionText);

          const soapNoteResult = await generateSoapNote(transcriptionText);
          setSoapNote(soapNoteResult);
        } catch (error) {
          console.error("Error processing recording:", error);
          if (error instanceof Error) {
            if (error.message.includes("No transcript generated")) {
              setError(
                "We couldn't detect any speech in your recording. Please try speaking more clearly."
              );
            } else if (
              error.message.includes("network") ||
              error.message.includes("connection")
            ) {
              setError(
                "Network error occurred. Please check your internet connection and try again."
              );
            } else {
              setError(
                "An error occurred while processing your recording. Please try again."
              );
            }
          } else {
            setError("An unexpected error occurred. Please try again.");
          }
        } finally {
          setIsProcessing(false);
          setIsChunking(false);
          setTotalChunks(0);
        }
      };

      mediaRecorder.onstop = processRecording;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setTotalChunks((prev) => prev + 1);
          setIsChunking(true);
        }
      };
      mediaRecorder.start(10000); // Collect data in 10-second chunks
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setIsRecording(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setError("Please upload an audio file");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const fileBuffer = await file.arrayBuffer();
      const audioBlob = new Blob([fileBuffer], { type: "audio/webm" });

      if (audioBlob.size === 0) {
        setError("The audio file appears to be empty or corrupted");
        return;
      }

      setAudioBlob(audioBlob);

      const transcriptionText = await transcribeAudio(audioBlob);
      setTranscription(transcriptionText);

      const soapNoteResult = await generateSoapNote(transcriptionText);
      setSoapNote(soapNoteResult);
    } catch (error) {
      console.error("Error processing audio file:", error);
      if (error instanceof Error) {
        setError(
          error.message.includes("No speech detected")
            ? "No speech detected in the audio file"
            : "An error occurred while processing the audio file. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 p-4 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <RecordingCard
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onFileUpload={handleFileUpload}
          audioBlob={audioBlob}
          isChunking={isChunking}
          totalChunks={totalChunks}
          error={error}
        />
      </div>

      {(transcription || isProcessing) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ResultsTabs
            isProcessing={isProcessing}
            transcription={transcription}
            soapNote={soapNote}
          />
        </div>
      )}
    </div>
  );
}
