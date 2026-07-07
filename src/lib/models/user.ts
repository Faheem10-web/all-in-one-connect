import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "SUPER_ADMIN" | "BUSINESS_OWNER" | "CUSTOMER";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  role: UserRole;
  isVerified: boolean;
  isSuspended: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: false, // Optional for OAuth accounts
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "BUSINESS_OWNER", "CUSTOMER"],
      default: "BUSINESS_OWNER",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Check compiled model caching to support Next.js Hot Module Replacement (HMR)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
