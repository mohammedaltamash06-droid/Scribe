export default async function mockTranscribe(): Promise<{ lines: string[] }> {
  // No audio fetch; always succeed
  return {
    lines: [
      "[mock] Transcription complete.",
      "This is a placeholder line to prove the pipeline works.",
      "Replace TRANSCRIBE_ENGINE=mock with openai when ready."
    ],
  };
}
