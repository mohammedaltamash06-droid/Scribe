
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/api/_lib/supabase";
import { runTranscribe } from "@/app/api/_lib/engines";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const supabase = supabaseAdmin();

  try {
    // 1) Load job
    const { data: job, error: jobErr } = await supabase
      .from("jobs").select("id,file_path").eq("id", jobId).single();

    if (jobErr || !job) {
      return NextResponse.json(
        { error: "Job not found", detail: jobErr?.message },
        { status: 404 }
      );
    }
    if (!job.file_path) {
      return NextResponse.json(
        { error: "Job has no file_path (upload step missing)" },
        { status: 400 }
      );
    }

    // 2) Signed URL for audio
    const { data: signed, error: signErr } = await supabase
      .storage.from("audio").createSignedUrl(job.file_path, 60 * 30);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to create signed URL", detail: signErr?.message },
        { status: 500 }
      );
    }

    // 3) Mark running
    await supabase.from("jobs").update({ state: "running" }).eq("id", jobId);

    // 4) Run engine
    let lines: string[] = [];
    try {
      const r = await runTranscribe({ audioUrl: signed.signedUrl });
      lines = r.lines || [];
    } catch (e: any) {
      await supabase.from("jobs").update({ state: "error" }).eq("id", jobId);
      return NextResponse.json(
        { error: "Transcription engine failed", detail: String(e?.message ?? e) },
        { status: 500 }
      );
    }

    // 5) Save result JSON
    const json = Buffer.from(JSON.stringify({ lines }, null, 2));
    const resultKey = `jobs/${jobId}/transcript.json`;
    const { error: putErr } = await supabase
      .storage.from("results").upload(resultKey, json, {
        contentType: "application/json",
        upsert: true,
      });

    if (putErr) {
      await supabase.from("jobs").update({ state: "error" }).eq("id", jobId);
      return NextResponse.json(
        { error: "Failed to save results", detail: putErr.message },
        { status: 500 }
      );
    }

    await supabase.from("jobs").update({ state: "done" }).eq("id", jobId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    // last-resort catch
    await supabase.from("jobs").update({ state: "error" }).eq("id", jobId);
    return NextResponse.json(
      { error: "Unhandled server error", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
