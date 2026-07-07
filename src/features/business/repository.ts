import Business, { IBusiness } from "@/lib/models/business";
import mongoose from "mongoose";

export class BusinessRepository {
  async findById(id: string): Promise<IBusiness | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Business.findById(id);
  }

  async findBySlug(slug: string): Promise<IBusiness | null> {
    return await Business.findOne({ businessSlug: slug.toLowerCase() });
  }

  async findAllByUserId(userId: string): Promise<IBusiness[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    return await Business.find({ userId: new mongoose.Types.ObjectId(userId) });
  }

  async create(data: Partial<IBusiness>): Promise<IBusiness> {
    return await Business.create(data);
  }

  async update(id: string, data: Partial<IBusiness>): Promise<IBusiness | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Business.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async softDelete(id: string): Promise<IBusiness | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Business.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true },
    );
  }

  async restore(id: string): Promise<IBusiness | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Business.findByIdAndUpdate(
      id,
      { $set: { isDeleted: false, deletedAt: null } },
      { new: true },
    );
  }

  async findAllForAdmin(): Promise<IBusiness[]> {
    // Admins want to view soft-deleted and pending businesses too
    return await Business.find({}).sort({ createdAt: -1 });
  }

  async updateStatus(
    id: string,
    status: "PENDING" | "APPROVED" | "SUSPENDED",
  ): Promise<IBusiness | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Business.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  }
}

export const businessRepository = new BusinessRepository();
