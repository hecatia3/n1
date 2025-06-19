"use client";
import { useState, useRef } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7860";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
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
    } else {
      alert("Gagal proses gambar");
    }
    setLoading(false);
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col items-center justify-start text-[#e6e4d7]">
      {/* Header */}
      <div className="flex flex-col items-center mt-8 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <img src="/fav.png" alt="NoneBG" className="w-10 h-10 rounded-full bg-[#232323]" />
<span
  className="text-2xl font-black tracking-widest text-white uppercase"
  style={{ fontFamily: "Horizon, Arial, sans-serif" }}
>
  NONEBG
</span>

        </div>
        <div className="text-2xl font-titillium font-semibold">
          <span className="text-[#F86748] font-edu font-bold">Free</span>{" "}
          and <span className="text-[#F86748] font-edu font-bold">No ADS</span>{" "}
          <span className="text-[#e6e4d7]">background removal tool</span>
        </div>
        <div className="mt-3 text-lg opacity-70 font-cascadia">
          using rembg code by daniEgatis
        </div>
      </div>

      {/* Upload area */}
      <div
        className="bg-[#e6e4d7] w-full max-w-4xl h-[340px] md:h-[350px] rounded-xl flex items-center justify-center border-4 border-dashed border-[#aaa] transition-all cursor-pointer mb-8"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInput.current?.click()}
      >
        {!image && !result && (
          <div className="text-[#7e7d74] text-2xl text-center px-6">
            Drag &amp; Drop image here<br />
            <span className="text-base text-[#adadad]">(or click to upload)</span>
          </div>
        )}
        {image && !result && (
          <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-[95%] max-w-[95%] rounded" />
        )}
        {result && (
          <img src={result} alt="Result" className="max-h-[95%] max-w-[95%] rounded" />
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInput}
          onChange={handleFileChange}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-8 justify-center mb-8">
        <button
          className="bg-[#e6e4d7] text-[#191919] font-black px-10 py-4 rounded-xl text-xl shadow hover:bg-[#dbdacb] transition disabled:opacity-60"
          onClick={handleUpload}
          disabled={!image || loading}
        >
          {loading ? "Processing..." : "PROSES"}
        </button>
        <button
          className="bg-[#e6e4d7] text-[#191919] font-black px-10 py-4 rounded-xl text-xl shadow hover:bg-[#dbdacb] transition disabled:opacity-60"
          onClick={() => {
            if (result) {
              const a = document.createElement("a");
              a.href = result;
              a.download = "output.png";
              a.click();
            }
          }}
          disabled={!result}
        >
          DOWNLOAD
        </button>
        <button
          className="bg-[#e6e4d7] text-[#191919] font-black px-10 py-4 rounded-xl text-xl shadow hover:bg-[#dbdacb] transition"
          onClick={handleClear}
        >
          CLEAR
        </button>
      </div>

      {/* Footer */}
      <div className="fixed bottom-5 left-5 opacity-80 flex items-center gap-2">
        <svg className="w-7 h-7" fill="#fff" viewBox="0 0 50 50">
          <path d="M25 3c12.131 0 22 9.869 22 22s-9.869 22-22 22S3 37.131 3 25 12.869 3 25 3zm0 2C13.849 5 5 13.849 5 25c0 11.151 8.849 20 20 20s20-8.849 20-20C45 13.849 36.151 5 25 5zm.25 8c2.067 0 4.167.505 6.014 1.511l-2.688 4.379A7.733 7.733 0 0025.25 18c-2.675 0-4.925-1.365-6.65-3.495l-2.66 4.308C17.583 21.353 21.25 24 25.25 24c4.006 0 7.65-2.65 9.322-6.302l-2.783-4.53C28.995 13.505 27.085 13 25.25 13zM25.25 26c-5.594 0-10.174 3.65-11.984 8.75h23.968C35.424 29.65 30.844 26 25.25 26zm-8.313 10a9.97 9.97 0 008.313 3.75c3.17 0 6.063-1.206 8.313-3.75H16.937z" />
        </svg>
        <span className="text-[#e6e4d7] text-lg font-bold">@c_7.29</span>
      </div>
    </div>
  );
}
