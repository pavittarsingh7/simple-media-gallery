import { execFile } from "child_process";
import { promisify } from "util";
import type { VideoMetadata } from "@/services/scanner/types";

const execFileAsync = promisify(execFile);

interface FfprobeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
  bit_rate?: string;
  channels?: number;
}

interface FfprobeFormat {
  duration?: string;
  bit_rate?: string;
}

interface FfprobeOutput {
  streams?: FfprobeStream[];
  format?: FfprobeFormat;
}

function parseFps(rate?: string): number | null {
  if (!rate || rate === "0/0") return null;
  const [num, den] = rate.split("/").map(Number);
  if (!den) return null;
  return Math.round((num / den) * 100) / 100;
}

export async function extractVideoMetadata(
  filePath: string
): Promise<VideoMetadata> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ]);

    const data: FfprobeOutput = JSON.parse(stdout);
    const videoStream = data.streams?.find((s) => s.codec_type === "video");
    const audioStream = data.streams?.find((s) => s.codec_type === "audio");
    const subtitleStream = data.streams?.find(
      (s) => s.codec_type === "subtitle"
    );

    const width = videoStream?.width ?? null;
    const height = videoStream?.height ?? null;
    const duration = data.format?.duration
      ? parseFloat(data.format.duration)
      : null;

    return {
      width,
      height,
      aspectRatio: width && height ? width / height : null,
      duration,
      bitrate: data.format?.bit_rate
        ? parseInt(data.format.bit_rate, 10)
        : videoStream?.bit_rate
          ? parseInt(videoStream.bit_rate, 10)
          : null,
      codec: videoStream?.codec_name ?? null,
      fps: parseFps(videoStream?.r_frame_rate),
      audioChannels: audioStream?.channels ?? null,
      hasSubtitles: !!subtitleStream,
      dominantColor: null,
      blurDataUrl: null,
      tags: [],
    };
  } catch {
    return {
      width: null,
      height: null,
      aspectRatio: null,
      duration: null,
      bitrate: null,
      codec: null,
      fps: null,
      audioChannels: null,
      hasSubtitles: false,
      dominantColor: null,
      blurDataUrl: null,
      tags: [],
    };
  }
}

export async function isFfprobeAvailable(): Promise<boolean> {
  try {
    await execFileAsync("ffprobe", ["-version"]);
    return true;
  } catch {
    return false;
  }
}
