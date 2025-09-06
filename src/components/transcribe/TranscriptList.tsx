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
export function normalizeLines(input: any): Line[] {
  const src = Array.isArray(input)
    ? input
    : input?.lines ?? input?.segments ?? [];

  return (src ?? []).map((item: any, i: number) => {
    if (typeof item === "string") {
      return { index: i, text: item } as Line;
    }
    return {
      index: item.index ?? i,
      text: item.text ?? "",
      start: item.start,
      end: item.end,
      speaker: item.speaker ?? item.speaker_label ?? item.spk,
      ...item,
    } as Line;
  });
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