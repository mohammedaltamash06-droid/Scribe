import { NextResponse } from "next/server";

export async function GET() {
  // stub data — replace with DB later
  return NextResponse.json({
    rows: [
      { date: new Date().toISOString(), file: "demo1.wav", minutes: 5, doctor: "demo", exportUrl: "#" },
      { date: new Date(Date.now() - 86400000).toISOString(), file: "demo2.wav", minutes: 7, doctor: "demo", exportUrl: "#" }
    ]
  });
}
