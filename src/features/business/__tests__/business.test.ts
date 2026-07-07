import { generateUniqueSlug } from "../slug";
import { CreateBusinessValidationSchema } from "../validation";
import Business from "@/lib/models/business";

jest.mock("@/lib/db", () => ({
  connectToDatabase: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/models/business", () => {
  return {
    findOne: jest.fn(),
  };
});

describe("Business Module - Unit & Validation Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    it("should pass validation when valid business data is provided", () => {
      const data = {
        name: "Acme Coffee Shop",
        category: "Food & Beverage",
        tagline: "The best brew in town",
        description: "Artisanal coffee and pastries.",
        email: "contact@acmeco.com",
        website: "https://acmecoffee.com",
      };

      const result = CreateBusinessValidationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail validation if required fields like name are missing", () => {
      const data = {
        category: "Food & Beverage",
      };

      const result = CreateBusinessValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toBeDefined();
      }
    });

    it("should fail validation if invalid email/website format is supplied", () => {
      const data = {
        name: "Invalid Business",
        category: "Technology",
        email: "bademail",
        website: "http://not-a-valid-url-without-domain",
      };

      const result = CreateBusinessValidationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Unique Slug Generator", () => {
    it("should slugify a business name and return it if no collisions exist", async () => {
      (Business.findOne as jest.Mock).mockResolvedValue(null);

      const slug = await generateUniqueSlug("My Café Shop!");
      expect(slug).toBe("my-cafe-shop");
      expect(Business.findOne).toHaveBeenCalledWith({
        businessSlug: "my-cafe-shop",
        isDeleted: { $ne: true },
      });
    });

    it("should resolve collisions by appending incrementing indexes", async () => {
      // First check: existing business matches
      // Second check: null (slug is unique)
      (Business.findOne as jest.Mock)
        .mockResolvedValueOnce({ name: "Collision Match" })
        .mockResolvedValueOnce(null);

      const slug = await generateUniqueSlug("Collision");
      expect(slug).toBe("collision-1");
      expect(Business.findOne).toHaveBeenCalledTimes(2);
    });
  });
});
