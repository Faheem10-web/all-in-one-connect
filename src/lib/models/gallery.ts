import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryItem extends Document {
  businessId: mongoose.Types.ObjectId;
  imageUrl: string;
  publicId: string; // Cloudinary resource ID for deletions
  title?: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const GalleryItem: Model<IGalleryItem> =
  mongoose.models.GalleryItem || mongoose.model<IGalleryItem>("GalleryItem", GalleryItemSchema);

export default GalleryItem;
