import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalFiles: 12,
    totalMinutes: 143,
    timeSavedMin: 87,
    autoCorrections: 23,
  });
}
