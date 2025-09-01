import { EngineArgs } from "./index";

export async function mockTranscribe(_: EngineArgs = {}) {
  await new Promise(r => setTimeout(r, 300)); // tiny delay like a real call
  return {
    lines: [
      { text: "This is a mock transcript line 1." },
      { text: "This is a mock transcript line 2." },
    ],
  };
}
