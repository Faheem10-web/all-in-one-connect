import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import { getSessionUserId } from "@/utils/session";
import { SocialLinksForm } from "@/components/dashboard/social-links-form";
import React from "react";

export default async function SocialPage() {
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

  // Serialize links array for client safety
  const serializedLinks = business.socialLinks
    ? business.socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url,
        isActive: link.isActive,
      }))
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Social Connections
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage links directing users to Facebook, Instagram, WhatsApp groups, portfolios, or
          external websites
        </p>
      </div>

      <SocialLinksForm businessId={business._id.toString()} initialLinks={serializedLinks} />
    </div>
  );
}
