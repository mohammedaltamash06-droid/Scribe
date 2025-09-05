"use client";

export type Line = {
  index: number;
  start?: number;
  end?: number;
  text: string;
  speaker?: string | null;
};

// Utility: format numbers safely
const toNumber = (v: any): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

/**
 * Robust normalizer:
 * - accepts Line[], { lines: Line[] }, { segments: {start,end,text}[] }, or string
 * - returns Line[]
 */
export function normalizeLines(input: unknown): Line[] {
  try {
    // Case 1: already Line[]
    if (Array.isArray(input)) {
      // ensure minimal shape
      return (input as any[]).map((row, i): Line => ({
        index: typeof row?.index === "number" ? row.index : i,
        start: toNumber((row as any)?.start),
        end: toNumber((row as any)?.end),
        text: String((row as any)?.text ?? ""),
        speaker: (row as any)?.speaker ?? null,
      }));
    }

    // Case 2: object with .lines
    if (input && typeof input === "object" && "lines" in (input as any)) {
      const arr = (input as any).lines;
      if (Array.isArray(arr)) return normalizeLines(arr);
    }

    // Case 3: object with .segments (faster-whisper style)
    if (input && typeof input === "object" && "segments" in (input as any)) {
      const segs = (input as any).segments;
      if (Array.isArray(segs)) {
        return segs.map((s: any, i: number): Line => ({
          index: i,
          start: toNumber(s?.start),
          end: toNumber(s?.end),
          text: String(s?.text ?? ""),
          speaker: s?.speaker ?? null,
        }));
      }
    }

    // Case 4: plain string (split on newlines into pseudo-lines)
    if (typeof input === "string") {
      const rows = input.split(/\r?\n/).filter(Boolean);
      return rows.map((t, i) => ({
        index: i,
        text: t.trim(),
      }));
    }

    // Unknown shape → empty list
    return [];
  } catch {
    return [];
  }
}

/**
 * TranscriptList renders normalized transcript lines with start/end times and text.
 * Accepts an array of Line objects (use normalizeLines before passing data).
 */
export default function TranscriptList({ lines }: { lines: Line[] }) {
  return (
    <div className="space-y-3">
      {lines.map((line) => (
        <div key={line.index} className="p-4 rounded-lg border bg-white">
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