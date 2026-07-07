import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnalytics extends Document {
  businessId: mongoose.Types.ObjectId;
  deviceType: "MOBILE" | "TABLET" | "DESKTOP";
  browser?: string;
  os?: string;
  referrer?: string;
  country?: string;
  city?: string;
  language?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
  deviceType: { type: String, enum: ["MOBILE", "TABLET", "DESKTOP"], default: "MOBILE" },
  browser: { type: String, trim: true },
  os: { type: String, trim: true },
  referrer: { type: String, trim: true },
  country: { type: String, trim: true, default: "Unknown" },
  city: { type: String, trim: true, default: "Unknown" },
  language: { type: String, trim: true },
  utmSource: { type: String, trim: true },
  utmMedium: { type: String, trim: true },
  utmCampaign: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now, index: true }, // Optimized for time-series range queries
});

// Compound index for rendering owner dashboard charts efficiently
AnalyticsSchema.index({ businessId: 1, createdAt: -1 });

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
