
import { NextResponse } from "next/server";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

/** Use Node runtime; docx needs Buffer (not edge) */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  lines?: unknown;
  title?: string;
  filename?: string; // without extension
};

function normalizeLines(raw: unknown): string[] {
  // Accepts ["..."], [{text:"..."}], or {lines:[...]} like your result endpoint
  const src =
    Array.isArray(raw)
      ? raw
      : Array.isArray((raw as any)?.lines)
        ? (raw as any).lines
        : [];

  const clean = (s: any) => String(s ?? "").replace(/\s+/g, " ").trim();

  return (src as any[])
    .map((v) => (typeof v === "string" ? v : v?.text))
    .map(clean)
    .filter(Boolean);
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body.title || "Medical Transcript").trim();
  const filename = (body.filename || "transcript").replace(/[^a-z0-9-_]/gi, "_");
  const lines = normalizeLines(body.lines);

  if (!lines.length) {
    return NextResponse.json(
      { error: "No transcript lines provided." },
      { status: 400 }
    );
  }

  // Build the DOCX
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: new Date().toLocaleString(),
          italics: true,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Transcript lines
  for (const t of lines) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: t, size: 22 })],
        spacing: { after: 160 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 }, // ~1"
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  const headers = new Headers({
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename="${filename}.docx"`,
    "Content-Length": String(buffer.byteLength),
  });

  return new Response(new Uint8Array(buffer), { status: 200, headers });
}
