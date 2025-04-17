import RecordingInterface from "@/components/recording-interface";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Doctor-Patient Visit Recorder
          </h1>
          <p className="text-gray-600 mt-2">
            Record, transcribe, and generate SOAP notes for patient visits
          </p>
        </header>

        <RecordingInterface />
      </div>
    </main>
  );
}
