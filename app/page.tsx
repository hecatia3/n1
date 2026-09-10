"use client";
import { Client, handle_file } from "@gradio/client";
import { useState, useRef, useCallback, useEffect } from "react";

// Kumpulan GIF desktop — taruh file-filenya di /public lalu tambah/ganti
// path di bawah ini. Salah satunya dipilih acak tiap kali halaman dibuka
// atau di-reload.
const GIF_OPTIONS = ["/1.gif", "/2.gif", "/3.gif", "/4.gif", "/5.gif","/6.gif","/7.gif","/8.gif","/9.gif","/10.gif", "/11.gif",];

type Phase = "idle" | "uploading" | "queued" | "processing" | "done";
type Note = { id: number; message: string; icon: "warn" | "ok" };
type Theme = "light" | "dark";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Win95Home() {
  const [theme, setTheme] = useState<Theme>("light");
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [clock, setClock] = useState("00:00");
  const [igSelected, setIgSelected] = useState(false);
  const [notepadOpen, setNotepadOpen] = useState(false);
  const [notepadSelected, setNotepadSelected] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [appSelected, setAppSelected] = useState(false);
  const [gifMissing, setGifMissing] = useState(false);
  const [gifIndex, setGifIndex] = useState(0);
  const [customGifUrl, setCustomGifUrl] = useState<string | null>(null);
  const gifInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGifIndex(Math.floor(Math.random() * GIF_OPTIONS.length));
  }, []);

  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [notes, setNotes] = useState<Note[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("nonebg-theme")) as Theme | null;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("nonebg-theme", theme);
  }, [theme]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000 * 15);
    return () => clearInterval(id);
  }, []);

  const pushNote = useCallback((message: string, icon: Note["icon"] = "warn") => {
    const id = Date.now() + Math.random();
    setNotes((n) => [...n, { id, message, icon }]);
    setTimeout(() => setNotes((n) => n.filter((x) => x.id !== id)), 4000);
  }, []);

  useEffect(() => {
    if (!image) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const loading = phase === "uploading" || phase === "queued" || phase === "processing";

  const acceptFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushNote("Jenis file tidak didukung. Pilih file JPG atau PNG.");
      return;
    }
    setImage(file);
    setResult(null);
    setPhase("idle");
    setSliderPos(50);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
  if (!image) return;

  setPhase("uploading");
  setUploadPct(0);
  setResult(null);

  try {
    const client = await Client.connect("hecatia3/n2");

    setUploadPct(100);
    setPhase("processing");

    const response = await client.predict("/remove_bg", {
      image: handle_file(image),
    });

    console.log("Gradio response:", response);
    console.log("Gradio data:", response.data);

    const output = (response.data as any[])?.[0];

    if (!output) {
      throw new Error("Output Gradio kosong");
    }

    const outputUrl =
      typeof output === "string"
        ? output
        : output.url ?? output.path ?? null;

    if (!outputUrl) {
      console.error("Output object:", output);
      throw new Error("URL output tidak ditemukan");
    }

    setResult(outputUrl);
    setPhase("done");
    pushNote("Background berhasil dihapus.", "ok");
  } catch (err) {
    console.error("Gradio error:", err);
    setPhase("idle");
    pushNote("Operasi gagal. Tidak dapat memproses gambar.");
  }
};
  const handleCancel = () => {
  setPhase("idle");
  pushNote("Operasi dibatalkan.");
};

  const handleClear = () => {
  setImage(null);
  setResult(null);
  setPhase("idle");
  setUploadPct(0);

  if (fileInput.current) {
    fileInput.current.value = "";
  }
};

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "nonebg-output.png";
    a.click();
  };

  const handleGifChange = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushNote("File itu bukan gambar/GIF.");
      return;
    }
    if (customGifUrl) URL.revokeObjectURL(customGifUrl);
    setCustomGifUrl(URL.createObjectURL(file));
    setGifMissing(false);
    pushNote("GIF diganti.", "ok");
  };

  const updateSlider = (clientX: number) => {
    const el = compareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(100, Math.max(0, pct)));
  };

  return (
    <div
      className={`desktop theme-${theme}`}
      onClick={() => {
        if (startOpen) setStartOpen(false);
        if (igSelected) setIgSelected(false);
        if (notepadSelected) setNotepadSelected(false);
        if (appSelected) setAppSelected(false);
      }}
    >
      {/* DESKTOP ICONS */}
      <button
        className={`desktop-icon ${igSelected ? "selected" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setIgSelected(true);
          window.open("https://www.instagram.com/c_7.29", "_blank", "noopener,noreferrer");
        }}
        title="Buka Instagram @c_7.29"
      >
        <svg viewBox="0 0 32 32" className="desktop-icon-art" shapeRendering="crispEdges">
          <rect x="4" y="4" width="24" height="24" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <rect x="4" y="4" width="24" height="6" fill="#000000" />
          <rect x="8" y="6" width="4" height="2" fill="#ffffff" />
          <rect x="9" y="12" width="14" height="14" fill="none" stroke="#000000" strokeWidth="1.5" />
          <circle cx="16" cy="19" r="4" fill="none" stroke="#000000" strokeWidth="1.5" />
          <rect x="19" y="13" width="2" height="2" fill="#000000" />
        </svg>
        <span className="desktop-icon-label">Instagram</span>
      </button>

      <button
        className={`desktop-icon desktop-icon-2 ${notepadSelected ? "selected" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setNotepadSelected(true);
          setNotepadOpen(true);
        }}
        title="Buka readme.txt"
      >
        <svg viewBox="0 0 32 32" className="desktop-icon-art" shapeRendering="crispEdges">
          <polygon points="7,3 20,3 26,9 26,29 7,29" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <polygon points="20,3 20,9 26,9" fill="#c0c0c0" stroke="#000000" strokeWidth="1.5" />
          <rect x="10" y="14" width="12" height="1.5" fill="#000000" />
          <rect x="10" y="18" width="12" height="1.5" fill="#000000" />
          <rect x="10" y="22" width="8" height="1.5" fill="#000000" />
        </svg>
        <span className="desktop-icon-label">readme.txt</span>
      </button>

      <button
        className={`desktop-icon desktop-icon-3 ${appSelected ? "selected" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setAppSelected(true);
          setWindowOpen(true);
          setMinimized(false);
        }}
        title="Buka nonebg.exe"
      >
        <svg viewBox="0 0 32 32" className="desktop-icon-art" shapeRendering="crispEdges">
          <rect x="4" y="4" width="24" height="24" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
          <rect x="4" y="4" width="24" height="6" fill="#000080" />
          <rect x="6" y="6" width="3" height="2" fill="#ffffff" />
          <path d="M11 14 L21 24 M21 14 L11 24" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <circle cx="11" cy="14" r="1.6" fill="#000000" />
          <circle cx="11" cy="24" r="1.6" fill="#000000" />
        </svg>
        <span className="desktop-icon-label">nonebg.exe</span>
      </button>

      {/* WINDOW */}
      {windowOpen && (
      <div className={`window ${maximized ? "maximized" : ""}`}>
        <div className="titlebar">
          <div className="titlebar-left">
            <span className="titlebar-icon">✂</span>
            <span>nonebg.exe</span>
          </div>
          <div className="titlebar-controls">
            <button
              className="theme-btn"
              title={theme === "light" ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? "☾" : "☀"}
            </button>
            <button className="win-btn" title="Minimize" onClick={() => setMinimized((m) => !m)}>
              _
            </button>
            <button className="win-btn" title="Maximize" onClick={() => setMaximized((m) => !m)}>
              □
            </button>
            <button className="win-btn win-close" title="Tutup" onClick={() => setWindowOpen(false)}>
              ×
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            <div className="menubar">
              <span onClick={() => fileInput.current?.click()}>
                <u>F</u>ile
              </span>
              <span onClick={() => pushNote("nguwawor.", "warn")}>
                <u>E</u>dit
              </span>
              <span onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
                <u>V</u>iew
              </span>
              <span onClick={() => pushNote("nonebg — alat hapus background gratis, tanpa iklan.", "ok")}>
                <u>H</u>elp
              </span>
            </div>

            <div className="window-body">
              <fieldset className="groupbox">
                <legend>Remove Background</legend>

                <div
                  className={`dropzone ${dragActive ? "drag-active" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => !result && fileInput.current?.click()}
                >
                  {!image && !result && (
                    <div className="dropzone-hint">
                      <div>Taruh gambar di sini</div>
                      <div className="dim">atau klik untuk memilih file</div>
                    </div>
                  )}
                  {image && !result && (
                    <img src={imageUrl ?? undefined} alt="Preview" className="preview-img" />
                  )}
                  {result && (
                    <div
                      ref={compareRef}
                      className="compare"
                      onPointerDown={(e) => {
                        draggingRef.current = true;
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                        updateSlider(e.clientX);
                      }}
                      onPointerMove={(e) => draggingRef.current && updateSlider(e.clientX)}
                      onPointerUp={() => (draggingRef.current = false)}
                    >
                      <img src={imageUrl ?? undefined} alt="Sebelum" className="compare-img" />
                      <div className="compare-clip" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
                        <div className="checker" />
                        <img src={result} alt="Sesudah" className="compare-img" />
                      </div>
                      <div className="compare-handle" style={{ left: `${sliderPos}%` }}>
                        <div className="compare-grip">↔</div>
                      </div>
                      <span className="tag tag-left">sebelum</span>
                      <span className="tag tag-right">sesudah</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden-input"
                    ref={fileInput}
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                  />
                </div>

                {image && (
                  <div className="file-meta">
                    {image.name} — {formatBytes(image.size)}
                  </div>
                )}

                <div className="btn-row">
                  <button className="win-button" onClick={handleUpload} disabled={!image || loading || !!result}>
                    Hapus background
                  </button>
                  <button className="win-button" onClick={handleDownload} disabled={!result}>
                    Unduh
                  </button>
                  <button className="win-button" onClick={handleClear}>
                    Bersihkan
                  </button>
                </div>
              </fieldset>
            </div>

<div className="statusbar">
  <div className="status-panel status-main">
    {phase === "uploading" && "Mengunggah…"}
    {phase === "queued" && "Menunggu ZeroGPU…"}
    {phase === "processing" && "Memproses…"}
    {phase === "idle" && !image && "Siap."}
    {phase === "idle" && image && "Gambar dipilih."}
    {phase === "done" && "Selesai."}
  </div>
  <div className="status-panel">rembg engine</div>
  <div className="status-panel">
    {theme === "light" ? "Mode terang" : "Mode gelap"}
  </div>
</div>
          </>
        )}
      </div>
      )}

      {/* NOTEPAD — tentang web */}
      {notepadOpen && (
        <div className="notepad-window">
          <div className="window notepad">
            <div className="titlebar">
              <div className="titlebar-left">
                <span className="titlebar-icon">📝</span>
                <span>readme.txt - Notepad</span>
              </div>
              <div className="titlebar-controls">
                <button className="win-btn" title="Tutup" onClick={() => setNotepadOpen(false)}>
                  ×
                </button>
              </div>
            </div>
            <div className="menubar">
              <span onClick={() => setNotepadOpen(false)}>
                <u>F</u>ile
              </span>
              <span onClick={() => pushNote("Tidak ada teks untuk diedit.", "warn")}>
                <u>E</u>dit
              </span>
              <span onClick={() => pushNote("Tidak ada hasil pencarian.", "warn")}>
                <u>S</u>earch
              </span>
              <span onClick={() => pushNote("support https://saweria.co/Hecapondasi.", "ok")}>
                <u>H</u>elp
              </span>
            </div>
            <div className="notepad-body">
              <pre className="notepad-text">{`NONEBG - Free Background Remover
=================================

Apa ini?
nonebg adalah alat hapus background gambar
yang gratis dan tanpa iklan. Tinggal taruh
gambar, klik "Hapus background", selesai.

Ditenagai oleh:
rembg (open-source), oleh danielgatis
https://github.com/danielgatis/rembg

Kenapa dibikin?
Karena banyak tool sejenis di internet penuh
iklan, minta akun, atau ujung-ujungnya bayar
buat unduh hasil resolusi penuh. nonebg nggak
begitu.

Dibuat oleh:
@c_7.29 (Instagram)

Tips:
- Geser slider di hasil buat lihat before/after
- Tema gelap/terang ada di title bar & tray
- File kamu diproses lalu langsung dibuang,
  nggak disimpan di server
`}</pre>
            </div>
            <div className="statusbar">
              <div className="status-panel status-main">readme.txt</div>
            </div>
          </div>
        </div>
      )}

      {/* GIF FRAME — pilihan acak dari GIF_OPTIONS, atau ganti langsung lewat tombol */}
      <div className="gif-frame-wrap">
        <button className="gif-swap-btn" onClick={() => gifInput.current?.click()}>
          Ganti
        </button>
        <div className="gif-frame">
          {!gifMissing || customGifUrl ? (
            <img
              src={customGifUrl ?? GIF_OPTIONS[gifIndex]}
              alt=""
              className="gif-frame-img"
              onError={() => !customGifUrl && setGifMissing(true)}
            />
          ) : (
            <span className="gif-frame-placeholder">
              Taruh GIF di
              <br />
              {GIF_OPTIONS[gifIndex]}
            </span>
          )}
        </div>
        <span className="gif-credit">gif by seseren</span>
        <input
          type="file"
          accept="image/*"
          className="hidden-input"
          ref={gifInput}
          onChange={(e) => handleGifChange(e.target.files?.[0])}
        />
      </div>

      {/* PROCESSING DIALOG */}
      {loading && (
        <div className="overlay">
          <div className="window dialog">
            <div className="titlebar">
              <div className="titlebar-left">
                <span className="titlebar-icon">⏳</span>
                <span>
                  {phase === "uploading"
                    ? "Mengunggah"
                    : phase === "queued"
                      ? "Menunggu GPU"
                      : "Memproses"}
                </span>
              </div>
            </div>
            <div className="window-body dialog-body">
              <div className="dialog-file">{image?.name}</div>
              <div className="progress-track">
                {phase === "uploading" ? (
                  <div className="progress-fill" style={{ width: `${uploadPct}%` }} />
                ) : (
                  <div className="progress-fill progress-indeterminate" />
                )}
              </div>
              <div className="dialog-actions">
                <button className="win-button" onClick={handleCancel}>
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS */}
      <div className="notes">
        {notes.map((n) => (
          <div key={n.id} className="note window">
            <div className="titlebar note-titlebar">
              <div className="titlebar-left">
                <span className="titlebar-icon">{n.icon === "ok" ? "✓" : "!"}</span>
                <span>nonebg</span>
              </div>
              <button className="win-btn" onClick={() => setNotes((ns) => ns.filter((x) => x.id !== n.id))}>
                ×
              </button>
            </div>
            <div className="note-body">{n.message}</div>
          </div>
        ))}
      </div>

      {/* TASKBAR */}
      <div className="taskbar">
        <button className="start-btn" onClick={(e) => { e.stopPropagation(); setStartOpen((s) => !s); }}>
          <span className="start-icon">▦</span> Start
        </button>
        {startOpen && (
          <div className="start-menu" onClick={(e) => e.stopPropagation()}>
            <div className="start-item" onClick={() => setStartOpen(false)}>
              Programs
            </div>
            <div className="start-item" onClick={() => setStartOpen(false)}>
              Documents
            </div>
            <div
              className="start-item"
              onClick={() => {
                setTheme((t) => (t === "light" ? "dark" : "light"));
                setStartOpen(false);
              }}
            >
              Ganti tema
            </div>
            <div className="start-sep" />
            <div className="start-item" onClick={() => { pushNote("ngapain njir", "ok"); setStartOpen(false); }}>
              Shut Down…
            </div>
          </div>
        )}
        <div className="taskbar-sep" />
        {windowOpen && (
          <button className="task-item active" onClick={() => setMinimized((m) => !m)}>
            ✂ nonebg.exe
          </button>
        )}
        <div className="taskbar-spacer" />
        <div className="tray">
          <button
            className="tray-icon"
            title={theme === "light" ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
            onClick={(e) => {
              e.stopPropagation();
              setTheme((t) => (t === "light" ? "dark" : "light"));
            }}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
          <span className="tray-clock">{clock}</span>
        </div>
      </div>

      <style jsx>{`
        .desktop {
          position: relative;
          min-height: 100vh;
          padding: 24px 16px 64px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          font-family: Tahoma, "Segoe UI", Geneva, Verdana, sans-serif;
          font-size: 12px;
          box-sizing: border-box;
          transition: background 0.15s ease;
        }

        .desktop-icon {
          position: absolute;
          top: 20px;
          left: 16px;
          width: 74px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 6px 4px;
          background: none;
          border: 1px solid transparent;
          cursor: default;
          font-family: inherit;
        }
        .desktop-icon-art {
          width: 34px;
          height: 34px;
          filter: drop-shadow(1px 1px 0 rgba(0, 0, 0, 0.35));
        }
        .desktop-icon-label {
          font-size: 11px;
          color: #fff;
          text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
          text-align: center;
          line-height: 1.2;
        }
        .desktop-icon.selected {
          background: rgba(0, 0, 128, 0.5);
          border: 1px dotted #fff;
        }
        .theme-dark .desktop-icon.selected {
          background: rgba(124, 58, 237, 0.55);
        }
        .desktop-icon.selected .desktop-icon-label {
          background: #000080;
          text-shadow: none;
        }
        .theme-dark .desktop-icon.selected .desktop-icon-label {
          background: #7c3aed;
        }
        .desktop-icon-2 {
          top: 122px;
        }
        .desktop-icon-3 {
          top: 224px;
        }

        .notepad-window {
          position: fixed;
          top: 90px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 55;
          width: 92%;
          max-width: 460px;
        }
        .notepad {
          width: 100%;
          margin: 0;
        }
        .notepad-body {
          padding: 0;
        }
        .theme-light .notepad-body {
          background: #fff;
        }
        .theme-dark .notepad-body {
          background: #211f28;
        }
        .notepad-text {
          margin: 0;
          padding: 10px;
          font-family: "Cascadia Code", "Courier New", monospace;
          font-size: 12px;
          line-height: 1.5;
          white-space: pre-wrap;
          max-height: 320px;
          overflow-y: auto;
          color: inherit;
        }

        .gif-frame-wrap {
          position: fixed;
          right: 20px;
          bottom: 52px;
          width: 110px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 4px;
        }
        .gif-swap-btn {
          padding: 3px 0;
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
          color: #000;
        }
        .theme-light .gif-swap-btn {
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
        }
        .theme-dark .gif-swap-btn {
          background: #35313f;
          border: 2px outset #35313f;
          color: #e8e6f0;
        }
        .gif-swap-btn:active {
          border-style: inset;
        }
        .gif-credit {
          text-align: center;
          font-size: 10px;
          opacity: 0.75;
          color: #fff;
          text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.7);
          user-select: none;
        }
        .gif-frame {
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .theme-light .gif-frame {
          background: #e8e6da;
          border: 2px inset #c0c0c0;
        }
        .theme-dark .gif-frame {
          background: #211f28;
          border: 2px inset #35313f;
        }
        .gif-frame-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gif-frame-placeholder {
          font-size: 9px;
          text-align: center;
          color: #555;
          padding: 4px;
          word-break: break-word;
        }
        .theme-light {
          background: #008080;
          color: #000;
        }
        .theme-dark {
          background: #14121c;
          color: #e8e6f0;
        }

        .window {
          width: 100%;
          max-width: 560px;
          margin-top: 28px;
          box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.4);
        }
        .window.maximized {
          max-width: 100%;
          margin-top: 0;
        }
        .theme-light .window {
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
        }
        .theme-dark .window {
          background: #35313f;
          border: 2px outset #35313f;
        }

        .titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 4px 3px 6px;
          font-weight: bold;
          color: #fff;
        }
        .theme-light .titlebar {
          background: linear-gradient(90deg, #000080, #1084d0);
        }
        .theme-dark .titlebar {
          background: linear-gradient(90deg, #3d1a6b, #7c3aed);
        }
        .titlebar-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .titlebar-icon {
          display: inline-flex;
        }
        .titlebar-controls {
          display: flex;
          gap: 3px;
        }
        .win-btn,
        .theme-btn {
          width: 18px;
          height: 16px;
          font-size: 11px;
          line-height: 1;
          font-weight: bold;
          cursor: pointer;
          color: #000;
        }
        .theme-light .win-btn,
        .theme-light .theme-btn {
          background: #c0c0c0;
          border: 1px outset #c0c0c0;
        }
        .theme-dark .win-btn,
        .theme-dark .theme-btn {
          background: #35313f;
          border: 1px outset #35313f;
          color: #e8e6f0;
        }
        .win-btn:active,
        .theme-btn:active {
          border-style: inset;
        }

        .menubar {
          display: flex;
          gap: 14px;
          padding: 3px 8px;
          cursor: default;
          user-select: none;
        }
        .theme-light .menubar {
          background: #c0c0c0;
        }
        .theme-dark .menubar {
          background: #35313f;
        }
        .menubar span {
          cursor: pointer;
        }
        .menubar span:hover {
          text-decoration: none;
          background: #000080;
          color: #fff;
          padding: 0 2px;
        }
        .theme-dark .menubar span:hover {
          background: #7c3aed;
        }

        .window-body {
          padding: 10px;
        }
        .theme-light .window-body {
          background: #c0c0c0;
        }
        .theme-dark .window-body {
          background: #35313f;
        }

        .groupbox {
          border: 1px solid;
          padding: 14px 10px 10px;
          margin: 0;
        }
        .theme-light .groupbox {
          border-color: #808080 #fff #fff #808080;
        }
        .theme-dark .groupbox {
          border-color: #1c1a22 #55506a #55506a #1c1a22;
        }
        .groupbox legend {
          padding: 0 4px;
          font-weight: bold;
        }

        .dropzone {
          height: 200px;
          border: 1px inset #808080;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .theme-light .dropzone {
          background-color: #d8d5c6;
          background-image: linear-gradient(45deg, #c3c0b1 25%, transparent 25%),
            linear-gradient(-45deg, #c3c0b1 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #c3c0b1 75%),
            linear-gradient(-45deg, transparent 75%, #c3c0b1 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .theme-dark .dropzone {
          background-color: #2a2833;
          background-image: linear-gradient(45deg, #221f2a 25%, transparent 25%),
            linear-gradient(-45deg, #221f2a 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #221f2a 75%),
            linear-gradient(-45deg, transparent 75%, #221f2a 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          border-color: #1c1a22 #55506a #55506a #1c1a22;
        }
        .dropzone.drag-active {
          outline: 2px dashed #000080;
          outline-offset: -4px;
        }
        .theme-dark .dropzone.drag-active {
          outline-color: #b794f6;
        }
        .dropzone-hint {
          text-align: center;
          color: #555;
        }
        .theme-dark .dropzone-hint {
          color: #b5b0c4;
        }
        .dropzone-hint .dim {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 2px;
        }
        .preview-img {
          max-width: 94%;
          max-height: 94%;
          object-fit: contain;
        }
        .hidden-input {
          display: none;
        }

        .compare {
          position: absolute;
          inset: 0;
          touch-action: none;
        }
        .compare-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
          box-sizing: border-box;
        }
        .compare-clip {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .checker {
          position: absolute;
          inset: 0;
          background-color: #d8d5c6;
          background-image: linear-gradient(45deg, #c3c0b1 25%, transparent 25%),
            linear-gradient(-45deg, #c3c0b1 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #c3c0b1 75%),
            linear-gradient(-45deg, transparent 75%, #c3c0b1 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .compare-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #000080;
          cursor: ew-resize;
        }
        .theme-dark .compare-handle {
          background: #b794f6;
        }
        .compare-grip {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          border: 1px outset #c0c0c0;
          background: #c0c0c0;
          color: #000;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tag {
          position: absolute;
          top: 4px;
          font-size: 10px;
          background: #000080;
          color: #fff;
          padding: 1px 4px;
        }
        .theme-dark .tag {
          background: #7c3aed;
        }
        .tag-left {
          left: 4px;
        }
        .tag-right {
          right: 4px;
        }

        .file-meta {
          margin-top: 6px;
          font-size: 11px;
          opacity: 0.75;
        }

        .btn-row {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .win-button {
          padding: 5px 14px;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          color: #000;
        }
        .theme-light .win-button {
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
        }
        .theme-dark .win-button {
          background: #35313f;
          border: 2px outset #35313f;
          color: #e8e6f0;
        }
        .win-button:active:not(:disabled) {
          border-style: inset;
        }
        .win-button:disabled {
          color: #808080;
          cursor: default;
        }
        .theme-dark .win-button:disabled {
          color: #6a6578;
        }
        .win-button:focus-visible {
          outline: 1px dotted #000;
        }
        .theme-dark .win-button:focus-visible {
          outline: 1px dotted #e8e6f0;
        }

        .statusbar {
          display: flex;
          gap: 4px;
          padding: 3px 6px 6px;
        }
        .status-panel {
          border: 1px inset #808080;
          padding: 2px 8px;
          font-size: 11px;
        }
        .theme-dark .status-panel {
          border-color: #1c1a22 #55506a #55506a #1c1a22;
        }
        .status-main {
          flex: 1;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        .dialog {
          width: 280px;
          margin: 0;
        }
        .dialog-body {
          text-align: center;
        }
        .dialog-file {
          font-size: 11px;
          margin-bottom: 8px;
          word-break: break-all;
        }
        .progress-track {
          height: 18px;
          border: 1px inset #808080;
          background: #fff;
          overflow: hidden;
          position: relative;
        }
        .theme-dark .progress-track {
          background: #211f28;
          border-color: #1c1a22 #55506a #55506a #1c1a22;
        }
        .progress-fill {
          height: 100%;
          background-image: repeating-linear-gradient(90deg, #008000 0 12px, transparent 12px 14px);
          transition: width 0.12s linear;
        }
        .theme-dark .progress-fill {
          background-image: repeating-linear-gradient(90deg, #7c3aed 0 12px, transparent 12px 14px);
        }
        .progress-indeterminate {
          width: 40%;
          animation: indeterminate 1s linear infinite;
        }
        @keyframes indeterminate {
          0% {
            margin-left: -40%;
          }
          100% {
            margin-left: 100%;
          }
        }
        .dialog-actions {
          margin-top: 10px;
        }

        .notes {
          position: fixed;
          bottom: 40px;
          right: 12px;
          z-index: 60;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 220px;
        }
        .note {
          margin: 0;
          box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
        }
        .note-titlebar {
          padding: 2px 4px 2px 6px;
        }
        .note-body {
          padding: 8px;
          font-size: 11px;
        }
        .theme-light .note-body {
          background: #c0c0c0;
        }
        .theme-dark .note-body {
          background: #35313f;
        }

        .taskbar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          height: 34px;
          display: flex;
          align-items: center;
          padding: 3px 4px;
          gap: 6px;
          z-index: 70;
        }
        .theme-light .taskbar {
          background: #c0c0c0;
          border-top: 2px outset #c0c0c0;
        }
        .theme-dark .taskbar {
          background: #35313f;
          border-top: 2px outset #35313f;
        }
        .start-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: bold;
          padding: 3px 10px;
          font-size: 12px;
          cursor: pointer;
          color: #000;
        }
        .theme-light .start-btn {
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
        }
        .theme-dark .start-btn {
          background: #35313f;
          border: 2px outset #35313f;
          color: #e8e6f0;
        }
        .start-icon {
          font-size: 11px;
        }
        .taskbar-sep {
          width: 2px;
          align-self: stretch;
          border-left: 1px solid #808080;
          border-right: 1px solid #fff;
        }
        .theme-dark .taskbar-sep {
          border-left-color: #1c1a22;
          border-right-color: #55506a;
        }
        .task-item {
          padding: 3px 10px;
          font-size: 12px;
          cursor: pointer;
          color: #000;
        }
        .theme-light .task-item {
          background: #c0c0c0;
          border: 1px inset #808080;
        }
        .theme-dark .task-item {
          background: #35313f;
          border: 1px inset #1c1a22;
          color: #e8e6f0;
        }
        .taskbar-spacer {
          flex: 1;
        }
        .tray {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          font-size: 11px;
        }
        .theme-light .tray {
          border: 1px inset #808080;
          background: #c0c0c0;
        }
        .theme-dark .tray {
          border: 1px inset #1c1a22;
          background: #35313f;
          color: #e8e6f0;
        }
        .tray-icon {
          width: 18px;
          height: 18px;
          font-size: 11px;
          line-height: 1;
          cursor: pointer;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .theme-light .tray-icon {
          background: #c0c0c0;
          border: 1px outset #c0c0c0;
        }
        .theme-dark .tray-icon {
          background: #35313f;
          border: 1px outset #35313f;
          color: #e8e6f0;
        }
        .tray-icon:active {
          border-style: inset;
        }
        .tray-clock {
          min-width: 32px;
          text-align: center;
        }

        .start-menu {
          position: fixed;
          left: 4px;
          bottom: 38px;
          width: 170px;
          z-index: 80;
          padding: 3px;
        }
        .theme-light .start-menu {
          background: #c0c0c0;
          border: 2px outset #c0c0c0;
        }
        .theme-dark .start-menu {
          background: #35313f;
          border: 2px outset #35313f;
        }
        .start-item {
          padding: 5px 10px;
          font-size: 12px;
          cursor: pointer;
        }
        .start-item:hover {
          background: #000080;
          color: #fff;
        }
        .theme-dark .start-item:hover {
          background: #7c3aed;
        }
        .start-sep {
          height: 1px;
          margin: 3px 2px;
          border-top: 1px solid #808080;
          border-bottom: 1px solid #fff;
        }
        .theme-dark .start-sep {
          border-top-color: #1c1a22;
          border-bottom-color: #55506a;
        }
      `}</style>
    </div>
  );
}
