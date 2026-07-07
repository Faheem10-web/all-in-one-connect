"use server";

import { connectToDatabase } from "@/lib/db";
import User, { UserRole } from "@/lib/models/user";
import ActivityLog from "@/lib/models/activity-log";
import mongoose from "mongoose";
import { auth } from "@/auth";

// Verifies session role is SUPER_ADMIN
async function verifyAdminSession() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super Admin access is required.");
  }
  return session.user;
}

export async function updateUserStatus(userId: string, isSuspended: boolean) {
  try {
    const admin = await verifyAdminSession();
    await connectToDatabase();

    const updated = await User.findByIdAndUpdate(userId, { $set: { isSuspended } }, { new: true });

    if (!updated) return { success: false, message: "User not found." };

    // Log admin action
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(admin.id),
      action: "SETTINGS_CHANGED",
      details: `Admin changed status of user "${updated.email}" to ${isSuspended ? "Suspended" : "Active"}.`,
    });

    return { success: true, message: `User status changed successfully.` };
  } catch (error: unknown) {
    console.error("Admin user status update error:", error);
    const message = error instanceof Error ? error.message : "Failed to update user status.";
    return { success: false, message };
  }
}

export async function deleteUser(userId: string) {
  try {
    const admin = await verifyAdminSession();
    await connectToDatabase();

    // Verify it's not the active admin deleting themselves
    if (admin.id === userId) {
      return { success: false, message: "Cannot delete your own active administrator profile." };
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) return { success: false, message: "User not found." };

    // Log action
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(admin.id),
      action: "SETTINGS_CHANGED",
      details: `Admin deleted user profile: "${user.email}".`,
    });

    return { success: true, message: "User profile deleted successfully." };
  } catch (error: unknown) {
    console.error("Admin user deletion error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete user.";
    return { success: false, message };
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const admin = await verifyAdminSession();
    await connectToDatabase();

    const updated = await User.findByIdAndUpdate(userId, { $set: { role } }, { new: true });

    if (!updated) return { success: false, message: "User not found." };

    // Log action
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(admin.id),
      action: "SETTINGS_CHANGED",
      details: `Admin modified role of user "${updated.email}" to "${role}".`,
    });

    return { success: true, message: `Role changed successfully.` };
  } catch (error: unknown) {
    console.error("Admin role update error:", error);
    const message = error instanceof Error ? error.message : "Failed to update role.";
    return { success: false, message };
  }
}
