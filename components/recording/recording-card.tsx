"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square } from "lucide-react";

interface RecordingCardProps {
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  audioBlob: Blob | null;
  isChunking?: boolean;
  totalChunks?: number;
  error?: string | null;
}

export function RecordingCard({
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  audioBlob,
  isChunking,
  totalChunks,
  error,
}: RecordingCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const MAX_RECORDING_TIME = 50 * 60; // 50 minutes in seconds
  const recordingProgress = (recordingTime / MAX_RECORDING_TIME) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mic className="mr-2 h-5 w-5" />
          Recording
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {isRecording ? (
            <div className="w-full text-center space-y-2">
              <div className="text-2xl font-mono">
                {formatTime(recordingTime)}
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${recordingProgress}%` }}
                />
              </div>
              {isChunking && (
                <div className="text-sm text-gray-500">
                  Processing chunks: {totalChunks}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Ready to record</div>
          )}

          <div className="flex space-x-4">
            {!isRecording ? (
              <Button
                onClick={onStartRecording}
                className="bg-red-600 hover:bg-red-700"
                disabled={recordingTime >= MAX_RECORDING_TIME}
              >
                <Mic className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={onStopRecording} variant="outline">
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>

          {error ? (
            <div className="text-red-500 text-sm mt-4">{error}</div>
          ) : (
            audioBlob && (
              <div className="w-full mt-4">
                <audio
                  src={URL.createObjectURL(audioBlob)}
                  controls
                  className="w-full"
                />
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
