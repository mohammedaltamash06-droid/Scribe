import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  const supa = createAdminClient();

  const [{ count: total }, { count: done }, { count: err }] = await Promise.all([
    supa.from("jobs").select("*", { count: "exact", head: true }),
    supa.from("jobs").select("*", { count: "exact", head: true }).eq("state", "done"),
    supa.from("jobs").select("*", { count: "exact", head: true }).eq("state", "error"),
  ]);

  const { data: avgRow } = await supa
    .from("jobs")
    .select("avg:avg(duration_seconds)")
    .eq("state", "done")
    .single();

  return NextResponse.json({
    total_jobs: total ?? 0,
    completed_jobs: done ?? 0,
    error_count: err ?? 0,
    avg_processing_seconds: (avgRow as any)?.avg ?? 0,
  });
}
