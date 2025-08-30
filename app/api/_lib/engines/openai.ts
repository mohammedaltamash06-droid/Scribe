import OpenAI from "openai";
import { TranscribeEngine, registerEngine } from "./index";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const OPENAI_ENGINE: TranscribeEngine = {
  name: "openai",
  async transcribe({ audioUrl }) {
    // Whisper expects a file stream; fetch signed URL as a Blob and create a File
    const res = await fetch(audioUrl);
    const blob = await res.blob();
    // Use a File object for compatibility with OpenAI SDK
    const file = new File([blob], "audio.wav", { type: blob.type || "audio/wav" });

    const result = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "text",
    });

    return { text: (result as any).text || "" };
  },
};

registerEngine(OPENAI_ENGINE);
export default OPENAI_ENGINE;
