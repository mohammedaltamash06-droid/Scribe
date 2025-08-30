import { TranscribeEngine, registerEngine } from "./index";

const mock: TranscribeEngine = {
  name: "mock",
  async transcribe() {
    const lines = [
      "Subjective: patient reports mild chest discomfort.",
      "Objective: HR 78, BP 128/82, afebrile.",
      "Assessment: atypical chest pain.",
      "Plan: ECG, troponin, prescribe omeprazole 20mg daily."
    ];
    return { text: lines.join("\n"), lines };
  },
};

registerEngine(mock);
export default mock;
