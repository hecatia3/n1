
"use client";
import React, { useRef, useState, ChangeEvent, FormEvent } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7860";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Slider state
  const [sliderValue, setSliderValue] = useState(50);

  // Preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle file input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setResult(null);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle form submit
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const res = await fetch(`${BACKEND_URL}/remove-bg`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Remove background gagal");
      }
      const blob = await res.blob();
      setResult(URL.createObjectURL(blob));
    } catch (err: any) {
      alert(err.message || "Ups... Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Slider compare component
  const SlideCompare: React.FC = () => (
    <div style={{ position: "relative", width: 350, height: 350 }}>
      {/* Original image */}
      <img
        src={previewUrl!}
        alt="Original"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: 8,
          left: 0,
          top: 0,
        }}
      />
      {/* Output (no bg) image */}
      {result && (
        <img
          src={result}
          alt="No BG"
          style={{
            position: "absolute",
            width: `${sliderValue}%`,
            height: "100%",
            objectFit: "contain",
            borderRadius: 8,
            left: 0,
            top: 0,
            clipPath: `inset(0 ${100 - sliderValue}% 0 0)`,
          }}
        />
      )}
      {/* Slider bar */}
      <input
        type="range"
        min={0}
        max={100}
        value={sliderValue}
        onChange={e => setSliderValue(Number(e.target.value))}
        style={{
          position: "absolute",
          bottom: -32,
          left: 0,
          width: "100%",
          zIndex: 2,
        }}
      />
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-4">Remove Background</h1>
      <form onSubmit={handleUpload} className="mb-6 flex flex-col gap-4 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading || !image}
        >
          {loading ? "Processing..." : "Remove BG"}
        </button>
      </form>

      {image && previewUrl && (
        <div className="mt-6">
          {result ? (
            <SlideCompare />
          ) : (
            <img src={previewUrl} alt="Preview" className="max-w-xs rounded shadow" />
          )}
        </div>
      )}
    </main>
  );
}

