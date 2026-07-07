import { z } from "zod";

export const BrandingValidationSchema = z.object({
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format")
    .default("#2563eb"),
  textColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format")
    .default("#0f172a"),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).default("LIGHT"),
  buttonRadius: z.number().min(0).max(24).default(8),
  fontFamily: z.string().min(1).default("Inter"),
});

export const SocialLinkValidationSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Must be a valid web URL"),
  isActive: z.boolean().default(true),
});

export const BusinessHoursSchema = z.object({
  day: z.string().min(1),
  open: z.string().regex(/^([0-9]{2}):([0-9]{2})$/, "Invalid time format (HH:MM)"),
  close: z.string().regex(/^([0-9]{2}):([0-9]{2})$/, "Invalid time format (HH:MM)"),
  closed: z.boolean(),
});

export const CreateBusinessValidationSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(100),
  category: z.string().min(2, "Category is required"),
  tagline: z
    .string()
    .max(150, "Tagline can have at most 150 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description can have at most 1000 characters")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL format").optional().or(z.literal("")),
  hours: z.array(BusinessHoursSchema).optional(),
});

export const UpdateBusinessValidationSchema = CreateBusinessValidationSchema.partial().extend({
  branding: BrandingValidationSchema.optional(),
  socialLinks: z.array(SocialLinkValidationSchema).optional(),
});

export const CreateBusinessFormSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(100),
  category: z.string().min(2, "Category is required"),
  tagline: z.string().max(150).optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
});
