import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/api/_lib/supabase";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = supabaseServer();

  // download the file
  const path = `${id}/transcript.json`;
  const { data, error } = await supabase.storage.from("results").download(path);
  if (error) {
    return NextResponse.json({ lines: [], text: "" }, { status: 200 });
  }
  const json = JSON.parse(await data.text());
  // normalize to {lines: string[]}
  if (Array.isArray(json.lines)) return NextResponse.json({ lines: json.lines });
  if (typeof json.text === "string")
    return NextResponse.json({ lines: json.text.split(/\r?\n/).filter(Boolean) });

  return NextResponse.json({ lines: [] });
}
