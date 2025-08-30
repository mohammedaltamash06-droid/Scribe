import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseServer } from "@/app/api/_lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const doctorId = (body?.doctorId ?? "demo").toString();
    const jobId = randomUUID();

    const supabase = supabaseServer();
    const { error } = await supabase
      .from("jobs")
      .insert([{ id: jobId, doctor_id: doctorId, state: "created" }]);

    if (error) throw error;
    return NextResponse.json({ jobId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "create failed" }, { status: 500 });
  }
}
