import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import { getSessionUserId } from "@/utils/session";
import { EditProfileForm } from "@/components/dashboard/edit-profile-form";
import React from "react";

export default async function ProfilePage() {
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

  // Serialize business document fields for client side components safety
  const serializedBusiness = {
    _id: business._id.toString(),
    name: business.name,
    category: business.category,
    tagline: business.tagline,
    description: business.description,
    address: business.address,
    phone: business.phone,
    email: business.email,
    website: business.website,
    hours: business.hours
      ? business.hours.map((h) => ({
          day: h.day,
          open: h.open,
          close: h.close,
          closed: h.closed,
        }))
      : [],
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Business Information
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your profiles metadata, location coordinates, and operational details
        </p>
      </div>

      <EditProfileForm business={serializedBusiness} />
    </div>
  );
}
