"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface ResultsTabsProps {
  isProcessing: boolean;
  transcription: string;
  soapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
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
              <div className="whitespace-pre-wrap bg-white p-4 rounded-md border border-gray-200">
                {transcription}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="soap">
        <Card>
          <CardHeader>
            <CardTitle>SOAP Note</CardTitle>
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
                <div>
                  <h3 className="font-semibold text-gray-900">Subjective</h3>
                  <p className="mt-1 text-gray-700">{soapNote.subjective}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Objective</h3>
                  <p className="mt-1 text-gray-700">{soapNote.objective}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Assessment</h3>
                  <p className="mt-1 text-gray-700">{soapNote.assessment}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Plan</h3>
                  <p className="mt-1 text-gray-700">{soapNote.plan}</p>
                </div>
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
