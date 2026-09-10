import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    const token = process.env.HF_TOKEN as `hf_${string}` | undefined;

    if (!token) {
      return NextResponse.json(
        { error: "HF_TOKEN belum diset" },
        { status: 500 }
      );
    }

    const client = await Client.connect("hecatia3/n2", {
      hf_token: token,
    });

    const result = await client.predict("/remove_bg", {
      image: handle_file(file),
    });

    const output = (result.data as any[])?.[0];

    if (!output) {
      throw new Error("Output Hugging Face kosong");
    }

    const outputUrl =
      typeof output === "string"
        ? output
        : output.url ?? output.path;

    if (!outputUrl) {
      throw new Error("URL output tidak ditemukan");
    }

    const imageResponse = await fetch(outputUrl);

    if (!imageResponse.ok) {
      throw new Error("Gagal mengambil hasil gambar");
    }

    const buffer = await imageResponse.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("remove-bg API error:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan",
      },
      { status: 500 }
    );
  }
}
