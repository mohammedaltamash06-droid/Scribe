import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/api/_lib/supabase";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = supabaseAdmin();
  const key = `jobs/${id}/transcript.json`;
  const { data, error } = await supabase.storage.from("results").download(key);
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const json = await data.text();
  return new NextResponse(json, { headers: { "content-type": "application/json" } });
}
