import Business from "@/lib/models/business";
import { connectToDatabase } from "@/lib/db";

const RESERVED_SLUGS = [
  "login",
  "register",
  "dashboard",
  "admin",
  "api",
  "forgot-password",
  "reset-password",
  "verify-email",
  "settings",
  "profile",
  "public",
  "assets",
  "manifest",
  "sw",
  "qr",
];

export async function generateUniqueSlug(name: string): Promise<string> {
  await connectToDatabase();

  // Normalize diacritics/accents (e.g., café -> cafe)
  const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Clean and slugify
  let baseSlug = normalizedName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric/spaces/hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Strip leading/trailing hyphens

  if (!baseSlug) {
    baseSlug = "business";
  }

  let candidateSlug = baseSlug;
  let counter = 1;

  // Resolve collisions loop
  while (true) {
    const isReserved = RESERVED_SLUGS.includes(candidateSlug);
    const existingBusiness = await Business.findOne({
      businessSlug: candidateSlug,
      isDeleted: { $ne: true },
    });

    if (!isReserved && !existingBusiness) {
      return candidateSlug;
    }

    candidateSlug = `${baseSlug}-${counter}`;
    counter++;
  }
}
export default generateUniqueSlug;
