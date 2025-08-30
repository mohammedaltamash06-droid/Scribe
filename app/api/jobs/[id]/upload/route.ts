import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/api/_lib/supabase";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

    const supabase = supabaseServer();
    const path = `${id}/${file.name}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const up = await supabase.storage
      .from("audio")
      .upload(path, buf, { contentType: file.type || "application/octet-stream", upsert: true });
    if (up.error) throw up.error;

    const { error } = await supabase
      .from("jobs")
      .update({ file_name: file.name, file_path: path, state: "uploaded" })
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true, path });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "upload failed" }, { status: 500 });
  }
}
