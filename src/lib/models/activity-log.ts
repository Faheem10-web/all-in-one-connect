import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action:
    | "BUSINESS_CREATED"
    | "BUSINESS_UPDATED"
    | "BUSINESS_DELETED"
    | "QR_GENERATED"
    | "SETTINGS_CHANGED";
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: {
      type: String,
      enum: [
        "BUSINESS_CREATED",
        "BUSINESS_UPDATED",
        "BUSINESS_DELETED",
        "QR_GENERATED",
        "SETTINGS_CHANGED",
      ],
      required: true,
    },
    details: { type: String, required: true, trim: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
