import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { useState, useCallback, useEffect, useRef } from "react";
import { generateVideo } from "~/server/generateVideo";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "";
  } catch {
    return "";
  }
});

type AppState = "idle" | "generating" | "done" | "error";
type Format = "16:9" | "9:16";

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

function Home() {
  const businessName = Route.useLoaderData();
  const name = businessName || "VidSpark";

  const [state, setState] = useState<AppState>("idle");
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<Format>("16:9");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isMac, setIsMac] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setIsMac(
      typeof navigator !== "undefined" && navigator.platform?.includes("Mac"),
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setErrorMsg("Please enter a prompt first.");
      return;
    }
    setErrorMsg("");
    setState("generating");
    setProgress(0);
    setVideoUrl("");

    // Start simulated progress (fills to ~90% while we wait)
    const controller = new AbortController();
    abortRef.current = controller;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 90;
        }
        // Slow down as we approach 90%
        const increment = prev < 40 ? 3 : prev < 70 ? 1.5 : 0.7;
        return Math.min(prev + increment, 90);
      });
    }, 200);

    try {
      const result = await generateVideo({
        data: { prompt: prompt.trim(), format },
      });

      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);

      // Short delay so user sees 100% before the video appears
      await new Promise((r) => setTimeout(r, 400));

      setVideoUrl(result.videoUrl);
      setState("done");
    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMsg(message);
      setState("error");
    }
  }, [prompt, format]);

  const handleTryAgain = useCallback(() => {
    abortRef.current?.abort();
    setState("idle");
    setProgress(0);
    setErrorMsg("");
    setVideoUrl("");
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `vidspark-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [videoUrl]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleGenerate();
      }
    },
    [handleGenerate],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-purple-500/25">
            V
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{name}</h1>
            <p className="text-sm text-gray-400">Transform prompts into videos</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Input card */}
          {state === "idle" && (
            <div className="animate-fadeIn rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
              {/* Spark icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-600/20 ring-1 ring-purple-500/30">
                  <svg
                    className="h-7 w-7 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="mb-2 text-center text-2xl font-bold">
                Create an AI Video
              </h2>
              <p className="mb-8 text-center text-gray-400">
                Describe what you want to see and we'll generate it.
              </p>

              {/* Prompt textarea */}
              <div className="mb-6">
                <label
                  htmlFor="prompt"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Your prompt
                </label>
                <textarea
                  id="prompt"
                  rows={4}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setErrorMsg("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="A serene mountain sunset with birds flying over a calm lake..."
                  className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800/60 px-4 py-3 text-gray-100 placeholder-gray-500 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
                {errorMsg && (
                  <p className="mt-1.5 text-sm text-red-400">{errorMsg}</p>
                )}
              </div>

              {/* Format selector */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Output format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat("16:9")}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all ${
                      format === "16:9"
                        ? "border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/10"
                        : "border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                    }`}
                  >
                    {/* Landscape icon */}
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <rect
                        x="2"
                        y="5"
                        width="20"
                        height="14"
                        rx="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-sm font-medium">YouTube</span>
                    <span className="text-xs opacity-60">16:9</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat("9:16")}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-all ${
                      format === "9:16"
                        ? "border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/10"
                        : "border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-600 hover:text-gray-200"
                    }`}
                  >
                    {/* Portrait icon */}
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <rect
                        x="5"
                        y="2"
                        width="14"
                        height="20"
                        rx="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-sm font-medium">Shorts / Reels</span>
                    <span className="text-xs opacity-60">9:16</span>
                  </button>
                </div>
              </div>

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-lg font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                Generate Video
              </button>
              <p className="mt-3 text-center text-xs text-gray-500">
                Or press {isMac ? "⌘" : "Ctrl"}+Enter
              </p>
            </div>
          )}

          {/* Generating state */}
          {state === "generating" && (
            <div className="animate-fadeIn rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-8 flex justify-center">
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded-full bg-purple-400"
                      style={{
                        animation: `pulseDot 1.2s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <h2 className="mb-2 text-center text-xl font-bold">
                Creating your video...
              </h2>
              <p className="mb-6 text-center text-sm text-gray-400">
                Generating images and assembling your video
              </p>

              {/* Progress bar */}
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-gray-500">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Done state */}
          {state === "done" && (
            <div className="animate-fadeIn rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
              <h2 className="mb-2 text-center text-xl font-bold">
                Your video is ready!
              </h2>
              <p className="mb-6 text-center text-sm text-gray-400">
                Prompt: &ldquo;{prompt}&rdquo; &middot; Format: {format}
              </p>

              {/* Video player */}
              <div className="mb-6 overflow-hidden rounded-xl border border-gray-700 bg-black">
                <div
                  className={`relative w-full bg-gray-900 ${
                    format === "9:16"
                      ? "aspect-[9/16] max-w-sm mx-auto"
                      : "aspect-video"
                  }`}
                >
                  {videoUrl ? (
                    <video
                      className="h-full w-full"
                      src={videoUrl}
                      controls
                      autoPlay
                      playsInline
                    >
                      <source src={videoUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                      Loading video...
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98]"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="rounded-xl border border-gray-700 bg-gray-800/60 px-6 py-3 font-medium text-gray-300 transition-all hover:border-gray-600 hover:bg-gray-800 hover:text-white active:scale-[0.98]"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="animate-fadeIn rounded-2xl border border-red-800/50 bg-gray-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
                  <svg
                    className="h-7 w-7 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="mb-2 text-center text-xl font-bold text-red-300">
                Generation failed
              </h2>
              <p className="mb-6 text-center text-sm text-gray-400">
                {errorMsg}
              </p>

              <button
                type="button"
                onClick={handleTryAgain}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-lg font-semibold text-white shadow-lg shadow-purple-600/30 transition-all hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98]"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-center text-sm text-gray-500">
          Built with{" "}
          <a
            href="https://cto.new"
            className="mx-1 underline underline-offset-2 hover:text-gray-300"
          >
            cto.new
          </a>
        </div>
      </footer>
    </div>
  );
}
