import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  businessId?: mongoose.Types.ObjectId | null;
  type: "BUSINESS_CREATED" | "APPROVAL_STATUS" | "SUSPENDED" | "SYSTEM_ALERT";
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", default: null, index: true },
    type: {
      type: String,
      enum: ["BUSINESS_CREATED", "APPROVAL_STATUS", "SUSPENDED", "SYSTEM_ALERT"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    readStatus: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  },
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
