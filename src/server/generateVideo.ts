import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readdir, unlink, rmdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_URL =
  "https://api.stability.ai/v2beta/stable-image/generate/core";
const TEMP_ROOT = "/tmp/vidspark";
const JOB_TTL_MS = 60 * 60 * 1000;
const IMAGE_COUNT = 4;
const SECONDS_PER_IMAGE = 2.5;
const FADE_DURATION = 0.5;
const FPS = 24;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function cleanupOldJobs(): Promise<void> {
  try {
    const entries = await readdir(TEMP_ROOT).catch(() => [] as string[]);
    const now = Date.now();
    for (const entry of entries) {
      const dirPath = join(TEMP_ROOT, entry);
      try {
        const s = await stat(dirPath);
        if (now - s.mtimeMs > JOB_TTL_MS) {
          const files = await readdir(dirPath);
          await Promise.all(files.map((f) => unlink(join(dirPath, f))));
          await rmdir(dirPath);
        }
      } catch {
        // skip
      }
    }
  } catch {
    // best-effort
  }
}

async function generateImage(
  prompt: string,
  aspectRatio: string,
): Promise<Buffer> {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", "jpeg");
  form.append("aspect_ratio", aspectRatio);

  const resp = await fetch(STABILITY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${STABILITY_API_KEY}` },
    body: form,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `Stability AI returned ${resp.status}: ${text.slice(0, 300)}`,
    );
  }

  const arrayBuf = await resp.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function stitchVideo(
  imagePaths: string[],
  outputPath: string,
  width: number,
  height: number,
): Promise<void> {
  const totalDuration =
    IMAGE_COUNT * SECONDS_PER_IMAGE - (IMAGE_COUNT - 1) * FADE_DURATION;
  const framesPerImage = Math.round(SECONDS_PER_IMAGE * FPS);

  const filterParts: string[] = [];

  for (let i = 0; i < IMAGE_COUNT; i++) {
    filterParts.push(
      `[${i}:v]zoompan=z='min(zoom+0.0015,1.25)':d=${framesPerImage}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=${FPS},setpts=PTS-STARTPTS[v${i}]`,
    );
  }

  let prevLabel = "v0";
  let offset = SECONDS_PER_IMAGE;
  for (let i = 1; i < IMAGE_COUNT; i++) {
    const nextLabel = i === IMAGE_COUNT - 1 ? "outv" : `x${i}`;
    filterParts.push(
      `[${prevLabel}][v${i}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${offset}[${nextLabel}]`,
    );
    prevLabel = nextLabel;
    offset += SECONDS_PER_IMAGE;
  }

  const audioPart = `[0:a][1:a]amix=inputs=2:duration=first,volume=0.12,afade=t=in:d=1,afade=t=out:st=${totalDuration - 1}:d=1[a_out]`;
  const fullFilter = filterParts.join(";") + ";" + audioPart;

  const finalArgs: string[] = [
    ...imagePaths.flatMap((p) => [
      "-loop",
      "1",
      "-t",
      String(SECONDS_PER_IMAGE),
      "-i",
      p,
    ]),
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=220:duration=${totalDuration}`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=330:duration=${totalDuration}`,
    "-filter_complex",
    fullFilter,
    "-map",
    "[outv]",
    "-map",
    "[a_out]",
    "-t",
    String(totalDuration),
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-shortest",
    "-y",
    outputPath,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", finalArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";

    proc.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`),
        );
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn FFmpeg: ${err.message}`));
    });
  });
}

// ---------------------------------------------------------------------------
// Server function
// ---------------------------------------------------------------------------

export const generateVideo = createServerFn({ method: "POST" })
  .validator(
    (input: unknown): { prompt: string; format: "16:9" | "9:16" } => {
      const data = input as Record<string, unknown>;
      const prompt = typeof data.prompt === "string" ? data.prompt.trim() : "";
      const format = data.format;

      if (!prompt) throw new Error("prompt is required");
      if (format !== "16:9" && format !== "9:16")
        throw new Error('format must be "16:9" or "9:16"');

      return { prompt, format };
    },
  )
  .handler(async ({ data }) => {
    const { prompt, format } = data;

    if (!STABILITY_API_KEY) {
      throw new Error("STABILITY_API_KEY not configured");
    }

    const jobId = randomUUID();
    const jobDir = join(TEMP_ROOT, jobId);
    await mkdir(jobDir, { recursive: true });

    // Fire-and-forget cleanup
    cleanupOldJobs().catch(() => {});

    // Generate images
    const imagePaths: string[] = [];
    for (let i = 0; i < IMAGE_COUNT; i++) {
      const imgBuffer = await generateImage(prompt, format);
      const imgPath = join(jobDir, `frame_${i}.jpg`);
      await writeFile(imgPath, imgBuffer);
      imagePaths.push(imgPath);
    }

    // Stitch video
    const [w, h] = format === "16:9" ? [1920, 1080] : [1080, 1920];
    const outputPath = join(jobDir, "output.mp4");
    await stitchVideo(imagePaths, outputPath, w, h);

    return {
      jobId,
      status: "completed" as const,
      videoUrl: `/api/video/${jobId}`,
    };
  });
