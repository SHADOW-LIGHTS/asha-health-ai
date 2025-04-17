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
  const MIN_RECORDING_TIME = 3; // 3 seconds minimum recording time
  const [soapNote, setSoapNote] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 50 * 60; // 50 minutes in seconds

  const startRecording = async () => {
    try {
      if (recordingTime >= MAX_RECORDING_TIME) {
        console.warn("Maximum recording time reached");
        return;
      }
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
        if (recordingTime < MIN_RECORDING_TIME) {
          setError("Recording must be at least 3 seconds long");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (audioBlob.size === 0) {
          setError(
            "No audio detected. Please ensure your microphone is working and try speaking during the recording."
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
          setError("Failed to transcribe audio. Please try recording again.");
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
      mediaRecorder.start(5000); // Collect data in 5-second chunks
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
      if (recordingTime >= MAX_RECORDING_TIME) {
        console.warn("Recording stopped due to time limit");
      }
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

  return (
    <div className="space-y-6">
      <RecordingCard
        isRecording={isRecording}
        recordingTime={recordingTime}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        audioBlob={audioBlob}
        isChunking={isChunking}
        totalChunks={totalChunks}
        error={error}
      />

      {(transcription || isProcessing) && (
        <ResultsTabs
          isProcessing={isProcessing}
          transcription={transcription}
          soapNote={soapNote}
        />
      )}
    </div>
  );
}
