"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { SoapSection } from "./soap-section";

interface ResultsTabsProps {
  isProcessing: boolean;
  transcription: string;
  soapNote: {
    subjective: { text: string; sources: string[] };
    objective: { text: string; sources: string[] };
    assessment: { text: string; sources: string[] };
    plan: { text: string; sources: string[] };
  } | null;
}

export function ResultsTabs({
  isProcessing,
  transcription,
  soapNote,
}: ResultsTabsProps) {
  return (
    <Tabs defaultValue="transcription" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="transcription">Transcription</TabsTrigger>
        <TabsTrigger value="soap">SOAP Note</TabsTrigger>
      </TabsList>

      <TabsContent value="transcription">
        <Card>
          <CardHeader>
            <CardTitle>Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Processing audio...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap bg-white">
                {transcription}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="soap">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>SOAP Note</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  navigator.clipboard.writeText(
                    soapNote
                      ? Object.entries(soapNote)
                          .map(
                            ([key, section]) =>
                              `${
                                key.charAt(0).toUpperCase() + key.slice(1)
                              }:\n${section.text}`
                          )
                          .join("\n\n")
                      : ""
                  )
                }
              >
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!soapNote) return;
                  const content = Object.entries(soapNote)
                    .map(
                      ([key, section]) =>
                        `${key.charAt(0).toUpperCase() + key.slice(1)}:\n${
                          section.text
                        }`
                    )
                    .join("\n\n");
                  const blob = new Blob([content], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "soap-note.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">
                  Generating SOAP note...
                </span>
              </div>
            ) : soapNote ? (
              <div className="space-y-4">
                <SoapSection
                  title="Subjective"
                  text={soapNote.subjective.text}
                  sources={soapNote.subjective.sources}
                />
                <SoapSection
                  title="Objective"
                  text={soapNote.objective.text}
                  sources={soapNote.objective.sources}
                />
                <SoapSection
                  title="Assessment"
                  text={soapNote.assessment.text}
                  sources={soapNote.assessment.sources}
                />
                <SoapSection
                  title="Plan"
                  text={soapNote.plan.text}
                  sources={soapNote.plan.sources}
                />
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                SOAP note will appear here after processing
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
