import OpenAI from "openai";
import { toFile } from "openai/uploads";

const MODEL = process.env.OPENAI_STT_MODEL || "gpt-4o-mini-transcribe"; // or "whisper-1"

export async function openaiTranscribe({ audioUrl }: { audioUrl: string }) {
  if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

  const dl = await fetch(audioUrl);
  if (!dl.ok) throw new Error(`Audio download failed (${dl.status})`);
  const file = await toFile(Buffer.from(await dl.arrayBuffer()), "audio");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const tr = await client.audio.transcriptions.create({ file, model: MODEL });
  const text: string = (tr as any).text ?? String(tr);
  const lines = text.split(/\r?\n/).filter(Boolean);
  return { lines };
}
