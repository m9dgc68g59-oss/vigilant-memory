"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import BottomNav from "@/components/BottomNav";
import type { ReceiptData } from "@/types/receipt";

export default function ScanPage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleCameraClick() {
    cameraInputRef.current?.click();
  }

  function handleGalleryClick(e: React.MouseEvent) {
    e.preventDefault();
    galleryInputRef.current?.click();
  }

  async function handleScan() {
    if (!selectedFile) return;

    setIsScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Erro ao processar o talão.");
      }

      const data: ReceiptData = await response.json();

      // Serialise receipt data into searchParams for /confirmar
      const params = new URLSearchParams({
        data: JSON.stringify(data),
      });
      router.push(`/confirmar?${params.toString()}`);
    } catch (err) {
      console.error("Scan error:", err);
      setError(err instanceof Error ? err.message : "Erro ao processar o talão. Tenta novamente.");
    } finally {
      setIsScanning(false);
    }
  }

  function handleReset() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  return (
    <>
      <header className="px-5 pt-5">
        <Logo />
        <p className="mt-0.5 text-[13px] text-gray-500">Poupa nas compras, sem esforço</p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 pb-2">
        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!selectedFile && (
          <>
            {/* Camera button */}
            <button
              onClick={handleCameraClick}
              className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-primary bg-primary-light text-primary shadow-[0_4px_16px_rgba(46,125,50,0.18)] transition-transform hover:scale-[1.04]"
              title="Tirar foto ao talão"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-1 h-10 w-10"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="max-w-[100px] text-center text-[13px] font-semibold leading-tight">
                Tirar foto ao talão
              </span>
            </button>

            {/* Gallery link */}
            <a
              href="#"
              onClick={handleGalleryClick}
              className="mt-[18px] border-b-[1.5px] border-dashed border-gray-400 pb-px text-sm text-gray-700 transition-colors hover:border-primary hover:text-primary"
            >
              Ou escolhe uma foto da galeria
            </a>

            {/* Supported stores */}
            <div className="mt-8 text-center text-xs leading-relaxed text-gray-400">
              Suportamos talões do Continente, Pingo Doce e mais
              <div className="mt-1.5 flex justify-center gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                  Continente
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                  Pingo Doce
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                  + breve
                </span>
              </div>
            </div>
          </>
        )}

        {/* Preview + scan state */}
        {selectedFile && (
          <div className="flex w-full flex-1 flex-col items-center pt-2">
            {/* Image preview */}
            <div className="relative mb-4 w-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl ?? ""}
                alt="Pré-visualização do talão"
                className="max-h-[320px] w-full object-contain"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold">Erro</p>
                <p>{error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex w-full gap-3">
              <button
                onClick={handleReset}
                disabled={isScanning}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="btn-primary flex-1"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                    </svg>
                    A processar…
                  </span>
                ) : (
                  "Digitalizar talão"
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav currentPage="scan" />
    </>
  );
}
