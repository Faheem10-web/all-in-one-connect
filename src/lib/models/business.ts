import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBranding {
  primaryColor: string;
  textColor: string;
  theme: "LIGHT" | "DARK" | "SYSTEM";
  buttonRadius: number; // in pixels
  fontFamily: string;
}

export interface ISocialLink {
  platform: string;
  url: string;
  isActive: boolean;
}

export interface IBusiness extends Document {
  userId: mongoose.Types.ObjectId;
  businessSlug: string;
  name: string;
  category: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  logoPublicId?: string;
  coverUrl?: string;
  coverPublicId?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: Array<{ day: string; open: string; close: string; closed: boolean }>;
  branding: IBranding;
  socialLinks: ISocialLink[];
  status: "PENDING" | "APPROVED" | "SUSPENDED";
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const BrandingSchema = new Schema<IBranding>({
  primaryColor: { type: String, default: "#2563eb" },
  textColor: { type: String, default: "#0f172a" },
  theme: { type: String, enum: ["LIGHT", "DARK", "SYSTEM"], default: "LIGHT" },
  buttonRadius: { type: Number, default: 8 },
  fontFamily: { type: String, default: "Inter" },
});

const SocialLinkSchema = new Schema<ISocialLink>({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

const BusinessSchema = new Schema<IBusiness>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessSlug: { type: String, required: true, unique: true, index: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tagline: { type: String, trim: true },
    description: { type: String, trim: true },
    logoUrl: { type: String },
    logoPublicId: { type: String },
    coverUrl: { type: String },
    coverPublicId: { type: String },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    hours: {
      type: [
        {
          day: { type: String, required: true },
          open: { type: String, default: "09:00" },
          close: { type: String, default: "17:00" },
          closed: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    branding: { type: BrandingSchema, default: () => ({}) },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    status: { type: String, enum: ["PENDING", "APPROVED", "SUSPENDED"], default: "PENDING" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// Apply index filters to exclude soft-deleted items automatically
BusinessSchema.pre(/^find/, function (this: mongoose.Query<unknown, IBusiness>) {
  const query = this.getQuery();
  if (query && query.isDeleted === undefined) {
    this.find({ isDeleted: { $ne: true } });
  }
});

const Business: Model<IBusiness> =
  mongoose.models.Business || mongoose.model<IBusiness>("Business", BusinessSchema);

export default Business;
