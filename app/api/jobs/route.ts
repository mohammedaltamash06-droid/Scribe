import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/api/_lib/supabase";

export async function POST(req: Request) {
  try {
    const supabase = supabaseAdmin();

    // body is optional; your UI may or may not send doctorId
    let doctorId: string | null = null;
    try {
      const body = await req.json().catch(() => null);
      const raw = body?.doctorId ?? body?.doctor_id ?? null;
      doctorId = typeof raw === "string" && raw.trim().length ? raw.trim() : null;
    } catch {
      doctorId = null;
    }

    // If a doctorId was provided, ensure it exists to avoid FK errors
    if (doctorId) {
      const { error: upsertErr } = await supabase
        .from("doctors")
        .upsert({ id: doctorId })
        .select("id")
        .single();
      if (upsertErr) {
        return NextResponse.json(
          { error: "Failed to upsert doctor", detail: upsertErr.message },
          { status: 500 }
        );
      }
    }

    // Create job row
    const { data, error } = await supabase
      .from("jobs")
      .insert({
        doctor_id: doctorId,       // can be null
        state: "created",
        file_name: null,
        file_path: null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create job", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobId: data!.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unhandled error creating job", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
