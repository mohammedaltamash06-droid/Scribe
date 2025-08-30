import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/api/_lib/supabase";

// load mock engine immediately; load openai lazily if selected
import "@/app/api/_lib/engines/mock";
import { getEngine } from "@/app/api/_lib/engines";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = supabaseServer();

  try {
    // fetch job to get file_path
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("file_path")
      .eq("id", id)
      .single();
    if (jobErr) throw jobErr;
    if (!job?.file_path) throw new Error("file_path missing on job");

    // signed URL for the audio
    const { data: signed, error: signedErr } = await supabase.storage
      .from("audio")
      .createSignedUrl(job.file_path, 60 * 15);
    if (signedErr) throw signedErr;

    // mark running
    await supabase.from("jobs").update({ state: "running" }).eq("id", id);

    // choose engine
    const engineName = process.env.TRANSCRIBE_ENGINE || "mock";
    if (engineName === "openai") {
      await import("@/app/api/_lib/engines/openai"); // lazy load
    }
    const engine = getEngine(engineName);

    // transcribe
    const result = await engine.transcribe({ audioUrl: signed.signedUrl, jobId: id });

    // save transcript JSON in results bucket
    const payload = JSON.stringify(
      result.lines ? { lines: result.lines } : { text: result.text }
    );
    const up = await supabase.storage
      .from("results")
      .upload(`${id}/transcript.json`, Buffer.from(payload), {
        contentType: "application/json",
        upsert: true,
      });
    if (up.error) throw up.error;

    // mark done
    await supabase.from("jobs").update({ state: "done" }).eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    await supabaseServer().from("jobs").update({ state: "error" }).eq("id", id);
    return NextResponse.json({ error: e?.message || "process failed" }, { status: 500 });
  }
}
