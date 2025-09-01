
"use client";

// Robust normalizer for transcript lines
export interface Line {
  id: string;
  text: string;
  start?: number;
  end?: number;
  speaker?: string;
}

/**
 * Normalize various transcript line formats into a consistent array of Line objects.
 * Accepts arrays of strings, objects, or mixed, and handles missing fields.
 */
export function normalizeLines(input: any[]): Line[] {
  const toText = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.map(toText).join(" ");

    // common shapes from different engines
    if (typeof v === "object") {
      if ("text" in v) return toText((v as any).text);
      if ("content" in v) return toText((v as any).content);
      if ("value" in v) return toText((v as any).value);
      if ("transcript" in v) return toText((v as any).transcript);
      if ("message" in v) return toText((v as any).message);
    }

    // last resort – string coercion (still better than “[object Object]”)
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  return (input ?? []).map((row: any, i: number) => ({
    id: String(row?.id ?? i + 1),
    text: toText(row?.text ?? row),
    start: row?.start ?? row?.timestamp,
    end: row?.end,
    speaker: row?.speaker,
  }));
}

/**
 * TranscriptList renders normalized transcript lines with start/end times and text.
 * Accepts an array of Line objects (use normalizeLines before passing data).
 */
export default function TranscriptList({ lines }: { lines: Line[] }) {
  return (
    <div className="space-y-3">
      {lines.map((line) => (
        <div key={line.id} className="p-4 rounded-lg border bg-white">
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            {line.start !== undefined && (
              <span>Start: {line.start.toFixed(2)}s</span>
            )}
            {line.end !== undefined && (
              <span>End: {line.end.toFixed(2)}s</span>
            )}
            {line.speaker && (
              <span>Speaker: {line.speaker}</span>
            )}
          </div>
          <textarea
            defaultValue={line.text ?? ''}
            className="w-full bg-transparent outline-none resize-none whitespace-pre-wrap"
            rows={3}
            readOnly
          />
        </div>
      ))}
    </div>
  );
}