"use client";

interface SoapSectionProps {
  title: string;
  text: string;
  sources: string[];
}

export function SoapSection({ title, text, sources }: SoapSectionProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <div className="group relative">
        <p className="mt-1 text-gray-700 group-hover:underline">{text}</p>
        <div className="absolute hidden group-hover:block bg-white p-2 border border-gray-200 rounded shadow-lg z-10 bottom-full mb-2">
          <h4 className="font-medium">Source Transcript:</h4>
          <ul className="text-sm">
            {sources.map((source, i) => (
              <li key={i} className="py-1">
                {source}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
