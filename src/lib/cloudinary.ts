import { v2 as cloudinary } from "cloudinary";

// Lazily configure Cloudinary SDK credentials at runtime (not at module load time)
// to avoid build-time placeholder values being baked in.
function getConfiguredCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export { cloudinary };

interface UploadResult {
  publicId: string;
  secureUrl: string;
}

/**
 * Uploads a base64 encoded image string or buffer to a specific Cloudinary folder path.
 * Enforces automated optimization formats (WebP conversion, quality auto compression).
 */
export async function uploadToCloudinary(
  fileDataUri: string,
  folderPath: string,
): Promise<UploadResult> {
  try {
    const sdk = getConfiguredCloudinary();
    const result = await sdk.uploader.upload(fileDataUri, {
      folder: folderPath,
      resource_type: "image",
      fetch_format: "webp",
      quality: "auto",
    });

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload action failed:", error);
    throw new Error("Failed to upload image file to Cloudinary.");
  }
}

/**
 * Deletes an image from Cloudinary using its unique public ID.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const sdk = getConfiguredCloudinary();
    const result = await sdk.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary destruction action failed:", error);
    return false;
  }
}
