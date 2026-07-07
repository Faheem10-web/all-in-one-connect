"use server";

import { connectToDatabase } from "@/lib/db";
import Notification from "@/lib/models/notification";
import { auth } from "@/auth";

export async function markAsRead(notificationId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await connectToDatabase();
    await Notification.findByIdAndUpdate(notificationId, {
      $set: { readStatus: true },
    });

    return { success: true, message: "Marked as read." };
  } catch (error) {
    console.error("Mark notification read error:", error);
    return { success: false, message: "Failed to update notification status." };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "Unauthorized" };
    }

    await connectToDatabase();
    await Notification.findByIdAndDelete(notificationId);

    return { success: true, message: "Notification deleted." };
  } catch (error) {
    console.error("Delete notification error:", error);
    return { success: false, message: "Failed to delete notification." };
  }
}
