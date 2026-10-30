import Busboy from "busboy";
import type { IncomingMessage } from "node:http";
import { uploadService } from "../Modules/Upload/upload.service";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function parseAndUpload(req: IncomingMessage) {
  const bb = Busboy({
    headers: req.headers,
    limits: {
      files: 1,
      fileSize: MAX_FILE_SIZE,
      fields: 5,
      parts: 6,
    },
  });

  let uploadPromise: Promise<Awaited<ReturnType<typeof uploadService.upload>>> | null = null;
  let uploadError: Error | null = null;
  let fileFound = false;

  bb.on("file", (fieldName, file, info) => {
    if (fieldName !== "file") {
      file.resume();
      uploadError = new Error("Unexpected file field");
      return;
    }

    if (fileFound) {
      file.resume();
      uploadError = new Error("Only one file is allowed");
      return;
    }

    fileFound = true;

    if (!ALLOWED_TYPES.includes(info.mimeType)) {
      file.resume();
      uploadError = new Error("Invalid file type");
      return;
    }

    file.on("limit", () => {
      uploadError = new Error("File size exceeds 5 MB");
    });

    uploadPromise = uploadService.upload(file, "gocraft/avatars");
  });

  const parserPromise = new Promise<void>((resolve, reject) => {
    bb.on("close", resolve);
    bb.on("error", reject);
  });

  req.pipe(bb);

  await parserPromise;

  if (uploadError) {
    throw uploadError;
  }

  if (!fileFound || !uploadPromise) {
    throw new Error("No file uploaded");
  }

  const result = await uploadPromise;

  return result;
}
