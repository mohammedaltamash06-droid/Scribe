import { NextRequest } from "next/server";
import { supabaseServer } from "@/app/api/_lib/supabase";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("proc")
    .select("*")
    .eq("doctor_id", id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const supabase = supabaseServer();
  const body = await request.json();
  const { data, error } = await supabase
    .from("proc")
    .insert([{ ...body, doctor_id: id }]);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 201 });
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const supabase = supabaseServer();
  const body = await request.json();
  const { data, error } = await supabase
    .from("proc")
    .update(body)
    .eq("id", body.id)
    .eq("doctor_id", id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const supabase = supabaseServer();
  const body = await request.json();
  const { data, error } = await supabase
    .from("proc")
    .delete()
    .eq("id", body.id)
    .eq("doctor_id", id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), { status: 200 });
}
