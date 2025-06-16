"use client";
import React, { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7860";

export default function RemoveBgPage() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch(`${BACKEND_URL}/remove-bg`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const blob = await res.blob();
      setResult(URL.createObjectURL(blob));
      setImage(null);
    } else {
      alert("Remove background gagal!");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Remove Background</h1>
      <form onSubmit={handleUpload} className="space-y-4 w-full max-w-md">
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          className="block"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Processing..." : "Remove Background"}
        </button>
      </form>

      {image && !result && (
        <div className="mt-6">
          <div className="font-bold mb-2">Preview:</div>
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="max-w-xs border shadow rounded"
          />
        </div>
      )}

      {result && (
        <div className="mt-6">
          <div className="font-bold mb-2">Result:</div>
          <img src={result} alt="Output" className="max-w-xs border shadow rounded" />
          <a href={result} download="output.png" className="block mt-2 text-blue-600 underline">
            Download
          </a>
        </div>
      )}
    </main>
  );
}
