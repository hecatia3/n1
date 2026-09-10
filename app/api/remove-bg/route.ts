import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

// Route ini jalan di server (bukan browser), jadi HF_TOKEN aman dan
// tidak pernah terkirim ke client.
export const runtime = "nodejs";

const SPACE_ID = "hecatia3/n2";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Tidak ada file yang dikirim." },
        { status: 400 }
      );
    }

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      console.error("HF_TOKEN belum di-set di environment variable server.");
      return NextResponse.json(
        { error: "Server belum dikonfigurasi dengan benar. Coba lagi nanti." },
        { status: 500 }
      );
    }

    const client = await Client.connect(SPACE_ID, {
      hf_token: hfToken as `hf_${string}`,
    });

    const response = await client.predict("/remove_bg", {
      image: file,
    });

    const output = (response.data as any[])?.[0];
    const outputUrl =
      typeof output === "string" ? output : output?.url ?? output?.path ?? null;

    if (!outputUrl) {
      console.error("Gradio output tidak berisi url/path:", output);
      return NextResponse.json(
        { error: "Model tidak mengembalikan gambar." },
        { status: 502 }
      );
    }

    const imageRes = await fetch(outputUrl);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil hasil dari model." },
        { status: 502 }
      );
    }

    const arrayBuffer = await imageRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": imageRes.headers.get("content-type") || "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    // Kalau ZeroGPU masih kena limit meski sudah pakai token, pesan errornya
    // biasanya kebawa sampai sini — diteruskan ke frontend biar user tau.
    console.error("remove-bg API error:", err);
    return NextResponse.json(
      { error: err?.message || "Terjadi kesalahan saat memproses gambar." },
      { status: 500 }
    );
  }
}
