export async function whisperLocalTranscribe({ audioUrl }: { audioUrl: string }) {
  const base = process.env.TRANSCRIBE_BASE_URL || "http://127.0.0.1:8000";

  // Download audio (Supabase signed URL)
  const src = await fetch(audioUrl);
  if (!src.ok) throw new Error(`Audio download failed (${src.status})`);
  const buf = await src.arrayBuffer();

  const file = new File([buf], "audio-input", { type: "application/octet-stream" });
  const fd = new FormData();
  fd.append("audio", file);
  fd.append("language", "en");
  fd.append("beam_size", "1");
  fd.append("vad", "true");

  const res = await fetch(`${base}/transcribe`, { method: "POST", body: fd });
  const textBody = await res.text();
  if (!res.ok) throw new Error(`FastAPI /transcribe ${res.status}: ${textBody.slice(0,200)}`);

  const data = JSON.parse(textBody) as { text?: string };
  const text = (data.text || "").trim();
  const lines = text ? text.split(/\r?\n/).filter(Boolean) : ["(empty transcription)"];
  return { lines };
}
