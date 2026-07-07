// Mock the environment config module before imports run to prevent Zod verification failures in Jest tests
jest.mock("@/config/env", () => ({
  env: {
    CLOUDINARY_CLOUD_NAME: "test-cloud",
    CLOUDINARY_API_KEY: "test-key",
    CLOUDINARY_API_SECRET: "test-secret",
    MONGODB_URI: "mongodb://localhost:27017/test",
    AUTH_SECRET: "test-secret",
  },
}));

import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

// Mock the Cloudinary SDK methods natively to avoid issuing real web request payloads in unit tests
jest.mock("cloudinary", () => ({
  v2: {
    config: () => {},
    uploader: {
      upload: jest.fn().mockResolvedValue({
        public_id: "test-public-id",
        secure_url: "https://res.cloudinary.com/test/image/upload/v1/test.png",
      }),
      destroy: jest.fn().mockResolvedValue({
        result: "ok",
      }),
    },
  },
}));

describe("Cloudinary Services Integration", () => {
  it("should upload base64 images and return Cloudinary IDs and secure URLs", async () => {
    const result = await uploadToCloudinary(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "test/folder",
    );
    expect(result.publicId).toBe("test-public-id");
    expect(result.secureUrl).toContain("test.png");
  });

  it("should request asset destruction using stored public IDs", async () => {
    const success = await deleteFromCloudinary("test-public-id");
    expect(success).toBe(true);
  });
});
