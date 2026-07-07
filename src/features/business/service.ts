import { businessRepository } from "./repository";
import { generateUniqueSlug } from "./slug";
import QRCode from "@/lib/models/qrcode";
import Notification from "@/lib/models/notification";
import ActivityLog from "@/lib/models/activity-log";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { IBusiness } from "@/lib/models/business";
import mongoose from "mongoose";

export class BusinessService {
  async getPublicProfileBySlug(slug: string): Promise<IBusiness | null> {
    await connectToDatabase();
    const business = await businessRepository.findBySlug(slug);
    if (!business || business.status !== "APPROVED") {
      return null;
    }
    return business;
  }

  async getMyBusinesses(userId: string): Promise<IBusiness[]> {
    await connectToDatabase();
    return await businessRepository.findAllByUserId(userId);
  }

  async createBusiness(
    userId: string,
    data: { name: string; category: string; tagline?: string; description?: string },
  ): Promise<IBusiness> {
    await connectToDatabase();

    // Generate unique slug
    const businessSlug = await generateUniqueSlug(data.name);

    // Create business profile
    const business = await businessRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      businessSlug,
      name: data.name,
      category: data.category,
      tagline: data.tagline,
      description: data.description,
      status: "PENDING", // Requires administrative verification
      isDeleted: false,
    });

    // Generate unique dynamic shortUrl token for QR code redirections
    const shortUrlToken = crypto.randomBytes(4).toString("hex");
    await QRCode.create({
      businessId: business._id,
      shortUrl: shortUrlToken,
      style: {
        primaryColor: "#0f172a",
        backgroundColor: "#ffffff",
        eyeStyle: "SQUARE",
      },
      isActive: true,
    });

    // Trigger Notification for the business owner
    await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      businessId: business._id,
      type: "BUSINESS_CREATED",
      title: "Business Profile Created",
      message: `Your business "${data.name}" has been created and is pending administrative approval.`,
    });

    // Write audit log trace
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "BUSINESS_CREATED",
      details: `Created business profile: "${data.name}" with slug "${businessSlug}".`,
    });

    return business;
  }

  async updateBusiness(
    userId: string,
    businessId: string,
    data: Partial<IBusiness>,
  ): Promise<IBusiness> {
    await connectToDatabase();
    const business = await businessRepository.findById(businessId);

    if (!business) {
      throw new Error("Business not found");
    }

    // Verify ownership permissions
    if (business.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized to edit this business");
    }

    const updated = await businessRepository.update(businessId, data);
    if (!updated) {
      throw new Error("Failed to update business profile");
    }

    // Write audit log
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "BUSINESS_UPDATED",
      details: `Updated details for business: "${business.name}" (${businessId}).`,
    });

    return updated;
  }

  async deleteBusiness(userId: string, businessId: string): Promise<void> {
    await connectToDatabase();
    const business = await businessRepository.findById(businessId);

    if (!business) {
      throw new Error("Business not found");
    }

    // Verify ownership permissions
    if (business.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized to delete this business");
    }

    await businessRepository.softDelete(businessId);

    // Disable the linked QR code dynamically
    await QRCode.findOneAndUpdate({ businessId }, { $set: { isActive: false } });

    // Write audit log
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      action: "BUSINESS_DELETED",
      details: `Soft-deleted business profile: "${business.name}" (${businessId}).`,
    });
  }

  async adminGetBusinesses(): Promise<IBusiness[]> {
    await connectToDatabase();
    return await businessRepository.findAllForAdmin();
  }

  async adminUpdateStatus(
    adminId: string,
    businessId: string,
    status: "PENDING" | "APPROVED" | "SUSPENDED",
  ): Promise<IBusiness> {
    await connectToDatabase();
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business profile not found");
    }

    const updated = await businessRepository.updateStatus(businessId, status);
    if (!updated) {
      throw new Error("Failed to update status");
    }

    // Trigger Notification for the business owner
    await Notification.create({
      userId: business.userId,
      businessId: business._id,
      type: "APPROVAL_STATUS",
      title: `Profile Status: ${status}`,
      message: `Your business profile "${business.name}" status has been set to "${status}".`,
    });

    // Write admin audit log
    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(adminId),
      action: "SETTINGS_CHANGED",
      details: `Admin changed status of business "${business.name}" (${businessId}) to "${status}".`,
    });

    return updated;
  }
}

export const businessService = new BusinessService();
