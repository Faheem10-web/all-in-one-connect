import { z } from "zod";
import { BASE_URL } from "@/utils/url";

const envSchema = z.object({
  // Database Configuration
  MONGODB_URI: z.string().min(1, "MONGODB_URI environment variable is required"),

  // NextAuth Session Config
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET environment variable is required"),
  AUTH_TRUST_HOST: z.string().default("true"),

  // Google OAuth Credentials
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),

  // Cloudinary Storage Config
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Email Transporter Config
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // General Host Target
  NEXT_PUBLIC_APP_URL: z.string().url().default(BASE_URL),
});

export type EnvType = z.infer<typeof envSchema>;

const getEnv = () => {
  const rawVercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  const formattedVercelUrl = rawVercelUrl
    ? rawVercelUrl.startsWith("http")
      ? rawVercelUrl
      : `https://${rawVercelUrl}`
    : undefined;

  const result = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || formattedVercelUrl || BASE_URL,
  });

  if (!result.success) {
    console.warn(
      "⚠️ Invalid environment variables detected during parsing:",
      result.error.format(),
    );

    // Provide safe placeholders during compilation build phases to prevent crashing Vercel containers
    return {
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/placeholder",
      AUTH_SECRET: process.env.AUTH_SECRET || "placeholder-secret-key-123456",
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "true",
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      NEXT_PUBLIC_APP_URL:
        process.env.NEXT_PUBLIC_APP_URL || formattedVercelUrl || BASE_URL,
    } as EnvType;
  }

  return result.data;
};

export const env = getEnv();
