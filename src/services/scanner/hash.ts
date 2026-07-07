import { createHash } from "crypto";
import { createReadStream } from "fs";
import { stat } from "fs/promises";

export async function computeFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

export async function computeQuickHash(
  filePath: string,
  fileSize: bigint,
  mtime: Date
): Promise<string> {
  const hash = createHash("sha256");
  hash.update(filePath);
  hash.update(fileSize.toString());
  hash.update(mtime.toISOString());
  return hash.digest("hex");
}

export async function getFileStats(filePath: string) {
  const stats = await stat(filePath);
  return {
    size: BigInt(stats.size),
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
  };
}
