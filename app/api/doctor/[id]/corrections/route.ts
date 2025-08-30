import { NextResponse } from "next/server";
import { supabaseServer } from "@/app/api/_lib/supabase";

function ensureDoctorId(id: string) { return id?.trim(); }

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const doctorId = ensureDoctorId(id);
  const supabase = supabaseServer();

  await supabase.from("doctors").upsert({ id: doctorId }); // ensure doctor exists
  const { data, error } = await supabase
    .from("doctor_corrections")
    .select("before_text, after_text")
    .eq("doctor_id", doctorId)
    .order("id", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data || []).map(r => ({ before: r.before_text, after: r.after_text })) });
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const doctorId = ensureDoctorId(id);
  const body = await req.json().catch(() => ({}));
  const items: Array<{ before: string; after: string }> = Array.isArray(body?.items) ? body.items : [];
  const supabase = supabaseServer();

  await supabase.from("doctors").upsert({ id: doctorId });
  // overwrite semantics: delete then insert
  const del = await supabase.from("doctor_corrections").delete().eq("doctor_id", doctorId);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

  if (items.length) {
    const ins = await supabase.from("doctor_corrections").insert(
      items.map(x => ({ doctor_id: doctorId, before_text: x.before, after_text: x.after }))
    );
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  }
  return NextResponse.json({ items });
}
