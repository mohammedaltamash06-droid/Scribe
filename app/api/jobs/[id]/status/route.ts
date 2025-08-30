import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/api/_lib/supabase";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("jobs")
      .select("state")
      .eq("id", id)
      .single();
    if (error) throw error;
    return NextResponse.json({ state: data?.state ?? "unknown" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "status failed" }, { status: 500 });
  }
}
