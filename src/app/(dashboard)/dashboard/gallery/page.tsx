import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import GalleryItem from "@/lib/models/gallery";
import { getSessionUserId } from "@/utils/session";
import { GalleryForm } from "@/components/dashboard/gallery-form";
import React from "react";

export default async function GalleryPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  await connectToDatabase();

  const userId = await getSessionUserId(session);

  const business = await Business.findOne({
    userId,
    isDeleted: { $ne: true },
  });

  if (!business) {
    redirect("/dashboard");
  }

  // Fetch gallery items linked to the business
  const items = await GalleryItem.find({ businessId: business._id }).sort({ order: 1 });

  // Serialize items
  const serializedItems = items.map((item) => ({
    _id: item._id.toString(),
    imageUrl: item.imageUrl,
    title: item.title,
    order: item.order,
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Media Gallery</h1>
        <p className="text-sm text-muted-foreground">
          Manage files, photos, product images, or layout banners shown on your business profile
        </p>
      </div>

      <GalleryForm businessId={business._id.toString()} initialItems={serializedItems} />
    </div>
  );
}
