// Utility to run the selected engine
import openaiTranscribe from "./openai";
import mockTranscribe from "./mock";
import { whisperLocalTranscribe } from "./whisper-local";

type RunArgs = { audioUrl: string };

export async function runTranscribe({ audioUrl }: RunArgs): Promise<{ lines: string[] }> {
  const eng = (process.env.TRANSCRIBE_ENGINE || "mock").toLowerCase();

  switch (eng) {
    case "openai":
      return openaiTranscribe({ audioUrl });
    case "whisper-local":
    case "local":
    case "whisper":
      return whisperLocalTranscribe({ audioUrl });
    default:
      return mockTranscribe();
  }

}
