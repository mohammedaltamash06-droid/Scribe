export type Transcript = { text: string; lines?: string[] };

export interface TranscribeEngine {
  name: string;
  transcribe(opts: { audioUrl: string; jobId: string }): Promise<Transcript>;
}

// registry (add engines here)
const engines: Record<string, TranscribeEngine> = {};

export function registerEngine(engine: TranscribeEngine) {
  engines[engine.name] = engine;
}

export function getEngine(name?: string): TranscribeEngine {
  const key = (name || process.env.TRANSCRIBE_ENGINE || "mock").toLowerCase();
  const engine = engines[key];
  if (!engine) throw new Error(`Transcribe engine "${key}" not found`);
  return engine;
}
