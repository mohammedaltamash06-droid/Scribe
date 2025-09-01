
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/api/_lib/supabase";
import { runTranscribe } from "@/app/api/_lib/engines";


export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const supabase = supabaseAdmin();

  try {
    // 1) Load job
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("id, file_path, state")
      .eq("id", jobId)
      .single();

    if (jobErr || !job) {
      return NextResponse.json(
        { error: "NOT_FOUND", detail: jobErr?.message ?? "Job not found" },
        { status: 404 }
      );
    }
    if (!job.file_path) {
      return NextResponse.json(
        {
          error: "MISSING_FILE_PATH",
          detail: "Job exists but has no file_path (upload step did not persist).",
          hint: "Re-run upload; ensure /api/jobs/:id/upload upserts { id, file_path } into jobs.",
        },
        { status: 400 }
      );
    }

    // 2) Signed URL
    const { data: signed, error: signErr } = await supabase
      .storage
      .from("audio")
      .createSignedUrl(job.file_path, 60 * 60);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json(
        {
          error: "SIGN_URL_FAILED",
          detail: signErr?.message ?? "Could not sign audio URL",
          hint: 'Confirm bucket name is "audio" and object exists. Check Storage → audio → object path.',
        },
        { status: 500 }
      );
    }

    // 3) Mark running (best-effort)
    await supabase.from("jobs").update({ state: "running" as any }).eq("id", jobId);

    // 4) Call engine (robust error reporting)
    let lines: Array<{ start?: number; end?: number; text: string }> = [];
    try {
      const res = await runTranscribe({ fileUrl: signed.signedUrl, language: "en" });
      lines = res.lines ?? [];
    } catch (e: any) {
      // Surface the exact engine error so the UI shows it
      const msg = typeof e?.message === "string" ? e.message : String(e);
      await supabase.from("jobs").update({ state: "error" as any }).eq("id", jobId);
      return NextResponse.json(
        {
          error: "ENGINE_ERROR",
          detail: msg,
          hint:
            'Ensure TRANSCRIBE_BASE_URL points to your FastAPI server, it is reachable, and /transcribe accepts JSON {url}. ' +
            'On the server, watch the uvicorn logs for requests/errors.',
        },
        { status: 502 }
      );
    }

    // 5) Save results JSON to "results" bucket
    const key = `jobs/${jobId}/transcript.json`;
    const payload = JSON.stringify({ lines }, null, 2);

    const { error: upErr } = await supabase
      .storage
      .from("results")
      .upload(key, new Blob([payload], { type: "application/json" }) as any, {
        upsert: true,
        contentType: "application/json",
      });

    if (upErr) {
      await supabase.from("jobs").update({ state: "error" as any }).eq("id", jobId);
      const msg = upErr.message ?? "Upload to results bucket failed";
      const missingBucketHint =
        msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("bucket")
          ? 'Create a private storage bucket named "results" in Supabase.'
          : undefined;

      return NextResponse.json(
        {
          error: "RESULTS_UPLOAD_FAILED",
          detail: msg,
          hint: missingBucketHint,
        },
        { status: 500 }
      );
    }

    // 6) Done
    await supabase.from("jobs").update({ state: "done" as any }).eq("id", jobId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : String(e);
    // Safety net
    try {
      await supabase.from("jobs").update({ state: "error" as any }).eq("id", jobId);
    } catch {}
    return NextResponse.json(
      { error: "UNHANDLED_SERVER_ERROR", detail: msg },
      { status: 500 }
    );
  }
}

