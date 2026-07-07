"use server";

import { connectToDatabase } from "@/lib/db";
import GalleryItem from "@/lib/models/gallery";
import mongoose from "mongoose";
import { auth } from "@/auth";

export async function addGalleryItem(
  businessId: string,
  imageUrl: string,
  title?: string,
  description?: string,
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await connectToDatabase();

    // Get count of existing items to append order
    const count = await GalleryItem.countDocuments({
      businessId: new mongoose.Types.ObjectId(businessId),
    });

    const newItem = await GalleryItem.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      imageUrl,
      publicId: "cloudinary-demo-id-" + Date.now(), // Mock Cloudinary ID
      title,
      description,
      order: count,
    });

    return {
      success: true,
      data: {
        _id: newItem._id.toString(),
        imageUrl: newItem.imageUrl,
        title: newItem.title,
        order: newItem.order,
      },
    };
  } catch (error) {
    console.error("Add gallery item error:", error);
    return { success: false, message: "Failed to add item." };
  }
}

export async function deleteGalleryItem(itemId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await connectToDatabase();
    await GalleryItem.findByIdAndDelete(itemId);

    return { success: true, message: "Item deleted successfully." };
  } catch (error) {
    console.error("Delete gallery item error:", error);
    return { success: false, message: "Failed to delete item." };
  }
}
