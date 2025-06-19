"use client";
import { useState, useRef } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7860";
const LOADING_GIFS = [
  "/loading1.gif",
  "/loading2.gif",
  "/loading3.gif",
  "/loading4.gif",
  "/loading5.gif",
  "/loading6.gif",
  "/loading7.gif",
];

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGif, setLoadingGif] = useState(LOADING_GIFS[0]);
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
    const randomIdx = Math.floor(Math.random() * LOADING_GIFS.length);
    setLoadingGif(LOADING_GIFS[randomIdx]);

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
    <div className="bg-[#181818] min-h-screen flex flex-col items-center justify-start text-[#e6e4d7] px-2">
      {/* POPUP LOADING GIF */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center pointer-events-auto">
          <div className="flex flex-col items-center bg-[#242424] bg-opacity-70 p-6 rounded-2xl shadow-xl">
            <img src={loadingGif} alt="Loading..." className="w-20 h-20 md:w-28 md:h-28 mb-2 rounded-lg" />
            <span className="text-white text-lg font-bold font-titillium">Processing...</span>
          </div>
          <div className="absolute bottom-3 right-3 text-xs text-white/80 font-cascadia pointer-events-none select-none">
            gif by seseren
          </div>
        </div>
      )}

      <div className="flex flex-col items-center mt-8 mb-4 w-full">
        <div className="flex items-center gap-2 mb-2">
          <img src="/fav.png" alt="NoneBG" className="w-10 h-10 rounded-full bg-[#232323]" />
          <span className="font-black text-2xl tracking-widest text-white font-titillium">NONEBG</span>
        </div>
        <div className="text-xl md:text-2xl font-titillium font-semibold text-center">
          <span className="text-[#F86748] font-edu font-bold">Free</span>{" "}
          and <span className="text-[#F86748] font-edu font-bold">No ADS</span>{" "}
          <span className="text-[#e6e4d7]">background removal tool</span>
        </div>
        <div className="mt-2 md:mt-3 text-base md:text-lg opacity-70 font-cascadia">
          <a href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-[#F86748] transition">
            using rembg code by daniEgatis
          </a>
        </div>
      </div>

<div
  className="
    bg-[#e6e4d7] 
    w-full
    max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl
    h-[160px] sm:h-[180px] md:h-[220px] lg:h-[270px]
    rounded-xl flex items-center justify-center 
    border-4 border-dashed border-[#aaa] 
    transition-all cursor-pointer mb-8 mx-auto
  "
  onDrop={handleDrop}
  onDragOver={(e) => e.preventDefault()}
  onClick={() => fileInput.current?.click()}
>

        {!image && !result && (
          <div className="text-[#7e7d74] text-lg md:text-2xl text-center px-3 md:px-6">
            Drag &amp; Drop image here<br />
            <span className="text-base text-[#adadad]">(or tap/click to upload)</span>
          </div>
        )}
        {image && !result && (
          <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-[90%] max-w-[95%] rounded" />
        )}
        {result && (
          <img src={result} alt="Result" className="max-h-[90%] max-w-[95%] rounded" />
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInput}
          onChange={handleFileChange}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center mb-8 w-full max-w-2xl">
        <button
          className="bg-[#e6e4d7] text-[#191919] font-black px-8 py-3 md:px-10 md:py-4 rounded-xl text-lg md:text-xl shadow hover:bg-[#dbdacb] transition disabled:opacity-60"
          onClick={handleUpload}
          disabled={!image || loading}
        >
          {loading ? "Processing..." : "PROSES"}
        </button>
        <button
          className="bg-[#e6e4d7] text-[#191919] font-black px-8 py-3 md:px-10 md:py-4 rounded-xl text-lg md:text-xl shadow hover:bg-[#dbdacb] transition disabled:opacity-60"
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
          className="bg-[#e6e4d7] text-[#191919] font-black px-8 py-3 md:px-10 md:py-4 rounded-xl text-lg md:text-xl shadow hover:bg-[#dbdacb] transition"
          onClick={handleClear}
        >
          CLEAR
        </button>
      </div>

      <div className="fixed bottom-4 left-4 opacity-80 flex items-center gap-2 z-10">
        <svg className="w-7 h-7" fill="#fff" viewBox="0 0 50 50">
          <path d="M25 3c12.131 0 22 9.869 22 22s-9.869 22-22 22S3 37.131 3 25 12.869 3 25 3zm0 2C13.849 5 5 13.849 5 25c0 11.151 8.849 20 20 20s20-8.849 20-20C45 13.849 36.151 5 25 5zm.25 8c2.067 0 4.167.505 6.014 1.511l-2.688 4.379A7.733 7.733 0 0025.25 18c-2.675 0-4.925-1.365-6.65-3.495l-2.66 4.308C17.583 21.353 21.25 24 25.25 24c4.006 0 7.65-2.65 9.322-6.302l-2.783-4.53C28.995 13.505 27.085 13 25.25 13zM25.25 26c-5.594 0-10.174 3.65-11.984 8.75h23.968C35.424 29.65 30.844 26 25.25 26zm-8.313 10a9.97 9.97 0 008.313 3.75c3.17 0 6.063-1.206 8.313-3.75H16.937z" />
        </svg>
        <a
          href="https://twitter.com/c_7_29"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e6e4d7] text-lg font-bold underline font-cascadia"
        >
          @c_7.29
        </a>
      </div>
    </div>
  );
}
