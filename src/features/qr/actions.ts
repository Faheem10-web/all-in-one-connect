"use server";

import { connectToDatabase } from "@/lib/db";
import QRCode, { IQRStyle } from "@/lib/models/qrcode";
import ActivityLog from "@/lib/models/activity-log";
import mongoose from "mongoose";
import { auth } from "@/auth";

export async function updateQRStyle(businessId: string, style: Partial<IQRStyle>) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return { success: false, message: "Unauthorized" };
    }

    await connectToDatabase();

    const updated = await QRCode.findOneAndUpdate(
      { businessId: new mongoose.Types.ObjectId(businessId) },
      {
        $set: {
          "style.primaryColor": style.primaryColor,
          "style.backgroundColor": style.backgroundColor,
          "style.eyeStyle": style.eyeStyle,
          "style.logoOverlay": style.logoOverlay,
        },
      },
      { new: true },
    );

    if (!updated) {
      return { success: false, message: "QR Code registry not found." };
    }

    // Write audit log
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      action: "QR_GENERATED",
      details: `Updated QR code styling settings for business ID: ${businessId}.`,
    });

    return { success: true, message: "QR Code style updated successfully!" };
  } catch (error) {
    console.error("Update QR style error:", error);
    return { success: false, message: "Failed to update style." };
  }
}
