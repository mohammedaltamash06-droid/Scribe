// ...existing code...
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
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

export async function GET(_req: Request, ctx: { params: MaybePromise<Params> }) {
  const supa = admin();
  const { id: jobId } = await Promise.resolve(ctx.params);

  const { data: job, error } = await supa
    .from("jobs")
    .select("result_path")
    .eq("id", jobId)
    .single();

  if (error) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (!job?.result_path) return NextResponse.json({ error: "Transcript not ready" }, { status: 404 });

  const { data, error: dlErr } = await supa.storage.from(RESULTS_BUCKET).download(job.result_path);
  if (dlErr || !data) return NextResponse.json({ error: "Transcript file missing" }, { status: 404 });

  return new Response(data, { headers: { "content-type": "application/json" } });
}

