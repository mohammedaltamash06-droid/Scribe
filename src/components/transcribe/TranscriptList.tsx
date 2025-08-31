"use client";

export default function TranscriptList({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-3">
      {lines.map((line, i) => (
        <div key={`line-${i}`} className="p-4 rounded-lg border bg-white">
          <textarea
            defaultValue={line ?? ''}
            className="w-full bg-transparent outline-none resize-none whitespace-pre-wrap"
            rows={3}
          />
        </div>
      ))}
    </div>
  );
}