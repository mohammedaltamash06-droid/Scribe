
// app/api/jobs/[id]/process/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const AUDIO_BUCKET   = "audio";
const RESULTS_BUCKET = "results";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

type Params = { id: string };
type MaybePromise<T> = T | Promise<T>;

async function callWhisperWithUrl(base: string, signedUrl: string) {
  return fetch(`${base}/transcribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: signedUrl, language: "en" }),
  });
}
async function callWhisperWithBinary(base: string, signedUrl: string, fileName: string) {
  const audioRes = await fetch(signedUrl);
  if (!audioRes.ok) throw new Error(`Audio download failed ${audioRes.status}`);
  const ab = await audioRes.arrayBuffer();
  const form = new FormData();
  form.append("audio", new Blob([ab]), fileName || "audio");
  return fetch(`${base}/transcribe`, { method: "POST", body: form });
}

export async function POST(_req: Request, ctx: { params: MaybePromise<Params> }) {
  const supa = admin();
  const { id: jobId } = await Promise.resolve(ctx.params);
  const base = process.env.TRANSCRIBE_BASE_URL!;
  await supa.from("jobs").update({ state: "running" }).eq("id", jobId);

  const { data: job } = await supa.from("jobs").select("file_path").eq("id", jobId).single();
  if (!job?.file_path) {
    await supa.from("jobs").update({ state: "error" }).eq("id", jobId);
    return NextResponse.json({ error: "No file uploaded for this job." }, { status: 400 });
  }
  const fileName = job.file_path.split("/").pop() || "audio";
  const signed = await supa.storage.from(AUDIO_BUCKET).createSignedUrl(job.file_path, 900);
  if (!signed.data?.signedUrl) {
    await supa.from("jobs").update({ state: "error" }).eq("id", jobId);
    return NextResponse.json({ error: "Could not sign audio" }, { status: 500 });
  }

  // Whisper call (JSON → fallback to multipart)
  let resp = await callWhisperWithUrl(base, signed.data.signedUrl);
  if (resp.status === 422 || resp.status === 404) {
    resp = await callWhisperWithBinary(base, signed.data.signedUrl, fileName);
  }
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    await supa.from("jobs").update({ state: "error" }).eq("id", jobId);
    return NextResponse.json({ error: "Transcribe failed", detail }, { status: 502 });
  }
  const result = await resp.json().catch(() => ({} as any));
  const transcript = result?.lines
    ? { lines: result.lines }
    : {
        lines: Array.isArray(result?.segments)
          ? result.segments.map((s: any) => ({
              start: s.start ?? 0,
              end: s.end ?? 0,
              text: String(s.text || "").trim(),
            }))
          : [],
      };

  const resultPath = `jobs/${jobId}/transcript.json`;
  const put = await supa.storage.from(RESULTS_BUCKET).upload(
    resultPath,
    new Blob([JSON.stringify(transcript)], { type: "application/json" }),
    { upsert: true, contentType: "application/json" }
  );
  if (put.error) {
    await supa.from("jobs").update({ state: "error" }).eq("id", jobId);
    return NextResponse.json({ error: "Failed to save transcript", detail: put.error.message }, { status: 500 });
  }

  const upd = await supa
    .from("jobs")
    .update({ state: "done", result_path: resultPath, duration_seconds: result?.duration_seconds ?? null })
    .eq("id", jobId)
    .select("result_path")
    .single();

  if (upd.error || !upd.data?.result_path) {
    await supa.from("jobs").update({ state: "error" }).eq("id", jobId);
    return NextResponse.json({ error: "Failed to update job.result_path" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, result_path: upd.data.result_path });
}

