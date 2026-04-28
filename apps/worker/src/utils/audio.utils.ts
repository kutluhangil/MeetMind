import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const TMP_DIR = process.env.TMP_DIR ?? '/tmp/meetmind';
const CHUNK_SIZE_BYTES = 24 * 1024 * 1024; // 24MB per chunk (Whisper limit is 25MB)

export async function normalizeAudio(inputPath: string): Promise<string> {
  const outputPath = path.join(TMP_DIR, `${path.basename(inputPath, path.extname(inputPath))}_normalized.wav`);
  await execAsync(
    `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${outputPath}"`
  );
  return outputPath;
}

export async function splitIntoChunks(filePath: string): Promise<string[]> {
  const stats = fs.statSync(filePath);
  if (stats.size <= CHUNK_SIZE_BYTES) {
    return [filePath];
  }

  // Get duration in seconds
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
  );
  const totalDuration = parseFloat(stdout.trim());
  const chunkCount = Math.ceil(stats.size / CHUNK_SIZE_BYTES);
  const chunkDuration = Math.ceil(totalDuration / chunkCount);

  const chunks: string[] = [];
  const baseName = path.basename(filePath, path.extname(filePath));

  for (let i = 0; i < chunkCount; i++) {
    const startTime = i * chunkDuration;
    const chunkPath = path.join(TMP_DIR, `${baseName}_chunk_${i}.wav`);
    await execAsync(
      `ffmpeg -y -i "${filePath}" -ss ${startTime} -t ${chunkDuration} -ar 16000 -ac 1 -c:a pcm_s16le "${chunkPath}"`
    );
    if (fs.existsSync(chunkPath)) {
      chunks.push(chunkPath);
    }
  }

  return chunks;
}

export function ensureTmpDir(): void {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
}

export function cleanupFiles(filePaths: string[]): void {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // best-effort cleanup
    }
  }
}
