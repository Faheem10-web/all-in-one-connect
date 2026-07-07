"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import GalleryItem from "@/lib/models/gallery";
import ActivityLog from "@/lib/models/activity-log";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import mongoose from "mongoose";

// Maximum image upload size: 40MB
const MAX_FILE_SIZE = 40 * 1024 * 1024;
// Supported mime-type headers
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

interface UploadResponse {
  success: boolean;
  message?: string;
  data?: {
    secureUrl: string;
    publicId: string;
    itemId?: string;
  };
}

export async function uploadBusinessImage(
  businessId: string,
  base64Data: string,
  target: "logo" | "cover" | "gallery",
  title?: string,
): Promise<UploadResponse> {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, message: "Authentication is required to upload images." };
    }

    await connectToDatabase();

    const business = await Business.findById(businessId);
    if (!business) {
      return { success: false, message: "Business profile not found." };
    }

    // Verify ownership permissions
    if (business.userId.toString() !== session.user.id.toString()) {
      return { success: false, message: "Forbidden: You do not own this business profile." };
    }

    // 1. Validation Checks
    const mimeMatch = base64Data.match(/^data:([^;]+);base64,/);
    if (!mimeMatch) {
      return { success: false, message: "Invalid image format header." };
    }

    const mimeType = mimeMatch[1];
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        success: false,
        message: "Unsupported file type. Please upload PNG, JPG, JPEG, or WEBP images.",
      };
    }

    // Estimate file size from base64 string
    const stringLength = base64Data.length - base64Data.indexOf(",") - 1;
    const sizeInBytes = Math.ceil(stringLength * 0.75);
    if (sizeInBytes > MAX_FILE_SIZE) {
      return { success: false, message: "Image file exceeds maximum limit of 40MB." };
    }

    // 2. Determine Folder Structure
    const folderPath = `businesses/${businessId}/${target}`;

    // 3. Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(base64Data, folderPath);

    // 4. Save to Database
    if (target === "logo") {
      // Clean up previous logo to free up space
      if (business.logoPublicId) {
        await deleteFromCloudinary(business.logoPublicId);
      }

      business.logoUrl = uploadResult.secureUrl;
      business.logoPublicId = uploadResult.publicId;
      await business.save();

      await ActivityLog.create({
        userId: new mongoose.Types.ObjectId(session.user.id),
        action: "BUSINESS_UPDATED",
        details: `Updated brand logo image for "${business.name}" (${businessId}).`,
      });
    } else if (target === "cover") {
      // Clean up previous cover
      if (business.coverPublicId) {
        await deleteFromCloudinary(business.coverPublicId);
      }

      business.coverUrl = uploadResult.secureUrl;
      business.coverPublicId = uploadResult.publicId;
      await business.save();

      await ActivityLog.create({
        userId: new mongoose.Types.ObjectId(session.user.id),
        action: "BUSINESS_UPDATED",
        details: `Updated cover layout photo for "${business.name}" (${businessId}).`,
      });
    } else if (target === "gallery") {
      const count = await GalleryItem.countDocuments({
        businessId: new mongoose.Types.ObjectId(businessId),
      });

      const newItem = await GalleryItem.create({
        businessId: new mongoose.Types.ObjectId(businessId),
        imageUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        title: title || "Gallery Image",
        order: count,
      });

      await ActivityLog.create({
        userId: new mongoose.Types.ObjectId(session.user.id),
        action: "BUSINESS_UPDATED",
        details: `Added new gallery photo "${title || "Gallery Image"}" for "${business.name}" (${businessId}).`,
      });

      return {
        success: true,
        data: {
          secureUrl: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          itemId: newItem._id.toString(),
        },
      };
    }

    return {
      success: true,
      data: {
        secureUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
      },
    };
  } catch (error: unknown) {
    console.error("Upload handler error:", error);
    const message = error instanceof Error ? error.message : "Failed to process image upload.";
    return { success: false, message };
  }
}
