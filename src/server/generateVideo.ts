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
const IMAGE_COUNT = 10;
const SECONDS_PER_IMAGE = 1.2;
const FADE_DURATION = 0.25;
const FPS = 24;
const FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";

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
    headers: { Authorization: `Bearer ${STABILITY_API_KEY}`, Accept: "image/*" },
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
  prompt: string,
  promptFilePath: string,
): Promise<void> {
  const totalDuration =
    IMAGE_COUNT * SECONDS_PER_IMAGE - (IMAGE_COUNT - 1) * FADE_DURATION;
  const framesPerImage = Math.round(SECONDS_PER_IMAGE * FPS);

  // Font size scales with resolution: (w+h)/48 gives ~62px for both 16:9 and 9:16
  const fontSize = Math.round((width + height) / 48);
  // Horizontal pan amplitude proportional to width
  const panAmplitude = Math.round(width * 0.015);

  const filterParts: string[] = [];

  // Step 1: Apply Ken Burns (zoom + parallax pan) to each image
  for (let i = 0; i < IMAGE_COUNT; i++) {
    const zoomIn = i % 2 === 0; // alternate zoom-in / zoom-out
    const zoomExpr = zoomIn
      ? `min(zoom+0.012,1.35)`
      : `if(eq(on,0),1.35,max(zoom-0.012,1))`;

    // x: center + horizontal sine-wave sway
    // y: center + subtle vertical cosine-wave wobble
    filterParts.push(
      `[${i}:v]zoompan=z='${zoomExpr}':d=${framesPerImage}:x='iw/2-(iw/zoom/2)+sin(on*0.08)*${panAmplitude}':y='ih/2-(ih/zoom/2)+cos(on*0.06)*${height / 80}':s=${width}x${height}:fps=${FPS},setpts=PTS-STARTPTS[v${i}]`,
    );
  }

  // Step 2: Crossfade chain
  let prevLabel = "v0";
  let offset = SECONDS_PER_IMAGE;
  for (let i = 1; i < IMAGE_COUNT; i++) {
    const nextLabel = i === IMAGE_COUNT - 1 ? "xfdone" : `x${i}`;
    filterParts.push(
      `[${prevLabel}][v${i}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${offset}[${nextLabel}]`,
    );
    prevLabel = nextLabel;
    offset += SECONDS_PER_IMAGE;
  }

  // Step 3: Post-processing chain — motion blur, text overlay, vignette, saturation
  filterParts.push(
    `[xfdone]tmix=frames=2:weights='1 1',drawtext=textfile='${promptFilePath}':fontfile=${FONT_PATH}:fontsize=${fontSize}:fontcolor=white:box=1:boxcolor=black@0.55:boxborderw=12:x=(w-text_w)/2:y=h-text_h-${Math.round(height * 0.04)}:alpha='if(lt(t,0.6),t/0.6,1)',vignette=PI/4,eq=saturation=1.3[outv]`,
  );

  // Step 4: Audio — layered sine waves for rich ambient tone
  // Inputs: [0:v]..[9:v] for images, [10:a]..[13:a] for sine waves
  const audioPart = `[${IMAGE_COUNT}:a][${IMAGE_COUNT + 1}:a][${IMAGE_COUNT + 2}:a][${IMAGE_COUNT + 3}:a]amix=inputs=4:duration=first,volume=0.07,afade=t=in:d=0.5,afade=t=out:st=${totalDuration - 0.5}:d=0.5[a_out]`;

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
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=440:duration=${totalDuration}`,
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=550:duration=${totalDuration}`,
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

    // Write prompt to a temp file for drawtext (avoids FFmpeg escaping issues)
    const promptFilePath = join(jobDir, "prompt.txt");
    await writeFile(promptFilePath, prompt, "utf-8");

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
    await stitchVideo(imagePaths, outputPath, w, h, prompt, promptFilePath);

    return {
      jobId,
      status: "completed" as const,
      videoUrl: `/api/video/${jobId}`,
    };
  });
