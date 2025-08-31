import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/api/_lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = supabaseAdmin();

  try {
    // DX
    const { count: dxCount, error: dxErr } = await supabase
      .from("dx")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", id);
    if (dxErr) throw dxErr;

    // RX
    const { count: rxCount, error: rxErr } = await supabase
      .from("rx")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", id);
    if (rxErr) throw rxErr;

    // PROC
    const { count: procCount, error: procErr } = await supabase
      .from("proc")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", id);
    if (procErr) throw procErr;

    return NextResponse.json({
      doctor_id: id,
      dx_count: dxCount ?? 0,
      rx_count: rxCount ?? 0,
      proc_count: procCount ?? 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
