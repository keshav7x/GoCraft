import { cloudinarySetup as cloudinary } from "../../Infra/clodinary/cloudinary";
import { Readable } from "node:stream";

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  resourceType: string;
}

export class UploadService {
  async upload(
    stream: Readable,
    folder = "gocraft",
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (error:any, result:any) => {
          if (error) return reject(error);

          if (!result) {
            return reject(new Error("Cloudinary upload failed"));
          }

          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            format: result.format,
            bytes: result.bytes,
            resourceType: result.resource_type,
          });
        },
      );

      stream.on("error", (error) => {
        uploadStream.destroy(error);
        reject(error);
      });

      uploadStream.on("error", reject);

      stream.pipe(uploadStream);
    });
  }

  async delete(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}

export const uploadService = new UploadService();
