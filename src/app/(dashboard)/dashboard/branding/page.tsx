import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import { getSessionUserId } from "@/utils/session";
import { BrandingForm } from "@/components/dashboard/branding-form";
import React from "react";

export default async function BrandingPage() {
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

  // Serialize branding values
  const serializedBranding = {
    primaryColor: business.branding?.primaryColor || "#2563eb",
    textColor: business.branding?.textColor || "#0f172a",
    theme: business.branding?.theme || "LIGHT",
    buttonRadius: business.branding?.buttonRadius ?? 8,
    fontFamily: business.branding?.fontFamily || "Inter",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Branding & Customization
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize colors, logo, cover layout settings, and fonts to match your company design
          guidelines
        </p>
      </div>

      <BrandingForm
        businessId={business._id.toString()}
        logoUrl={business.logoUrl}
        coverUrl={business.coverUrl}
        branding={serializedBranding}
      />
    </div>
  );
}
