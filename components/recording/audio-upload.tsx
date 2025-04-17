"use client";

import { Button } from "@/components/ui/button";

interface AudioUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AudioUpload({ onFileUpload }: AudioUploadProps) {
  return (
    <div className="relative">
      <input
        type="file"
        accept=".mp3,.wav,.m4a,.aac,.ogg,.flac,audio/*"
        onChange={onFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Button variant="outline">Upload Audio</Button>
    </div>
  );
}
