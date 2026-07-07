import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQRStyle {
  primaryColor: string;
  backgroundColor: string;
  eyeStyle: "SQUARE" | "CIRCLE" | "ROUNDED";
  logoOverlay?: string;
}

export interface IQRCode extends Document {
  businessId: mongoose.Types.ObjectId;
  shortUrl: string; // The dynamic URL generated (redirect hash)
  style: IQRStyle;
  isActive: boolean;
  scanCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QRStyleSchema = new Schema<IQRStyle>({
  primaryColor: { type: String, default: "#0f172a" },
  backgroundColor: { type: String, default: "#ffffff" },
  eyeStyle: { type: String, enum: ["SQUARE", "CIRCLE", "ROUNDED"], default: "SQUARE" },
  logoOverlay: { type: String },
});

const QRCodeSchema = new Schema<IQRCode>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
      index: true,
    },
    shortUrl: { type: String, required: true, unique: true, index: true },
    style: { type: QRStyleSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    scanCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const QRCode: Model<IQRCode> =
  mongoose.models.QRCode || mongoose.model<IQRCode>("QRCode", QRCodeSchema);

export default QRCode;
