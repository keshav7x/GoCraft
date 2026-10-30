import type { FastifyInstance, FastifyRequest } from "fastify";
import { parseAndUpload } from "../../lib/busboy";
import { AuthUtils } from "../Auth/auth.utils";
import { authRepositoryClass } from "../Auth/auth.repositary";
import { AppError } from "../../Infra/Error/errors";

const authUtils = new AuthUtils();
const authRepo = new authRepositoryClass();

const CONTENT_IMAGE_FOLDER = "gocraft/content";

async function requireAdmin(request: FastifyRequest): Promise<{ userId: number }> {
  const bearerToken = request.headers.authorization?.split(" ")[1];
  const cookies = request.cookies as Record<string, string | undefined> | undefined;
  const token = bearerToken || cookies?.session_token;

  if (!token) throw new AppError("Unauthorized access", 401);

  let payload: { userId: number };
  try {
    payload = authUtils.verifyJwtToken(token);
  } catch {
    throw new AppError("Unauthorized access", 401);
  }

  const isAdmin = await authRepo.isAdmin(payload.userId).catch(() => false);
  if (!isAdmin) throw new AppError("Admin access required", 403);

  return { userId: payload.userId };
}

export function registerUploadRoutes(server: FastifyInstance) {
  server.addContentTypeParser("multipart/form-data", (_req, _payload, done) => {
    done(null, _payload);
  });

  server.post("/upload/content-image", async (request, reply) => {
    await requireAdmin(request);

    try {
      const result = await parseAndUpload(request.raw, CONTENT_IMAGE_FOLDER);
      return reply.code(201).send({
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
      });
    } catch (error: any) {
      const message: string = error?.message ?? "Upload failed";

      if (message.includes("exceeds 5 MB")) {
        return reply.code(413).send({ error: { message, code: 413 } });
      }
      if (message === "Invalid file type") {
        return reply.code(415).send({ error: { message, code: 415 } });
      }
      if (
        message === "No file uploaded" ||
        message === "Unexpected file field" ||
        message === "Only one file is allowed"
      ) {
        return reply.code(400).send({ error: { message, code: 400 } });
      }

      request.log.error(error);
      return reply.code(500).send({ error: { message: "Upload failed", code: 500 } });
    }
  });
}
