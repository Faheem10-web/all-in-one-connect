import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import QRCode from "@/lib/models/qrcode";
import { QRManager } from "@/components/dashboard/qr-manager";
import { getSessionUserId } from "@/utils/session";
import React from "react";

export default async function QRPage() {
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

  // Fetch the registered QR Code document
  const qrCode = await QRCode.findOne({ businessId: business._id });
  if (!qrCode) {
    redirect("/dashboard");
  }

  // Serialize properties
  const serializedQr = {
    shortUrl: qrCode.shortUrl,
    style: {
      primaryColor: qrCode.style?.primaryColor || "#0f172a",
      backgroundColor: qrCode.style?.backgroundColor || "#ffffff",
      eyeStyle: qrCode.style?.eyeStyle || "SQUARE",
    },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dynamic QR Code</h1>
        <p className="text-sm text-muted-foreground">
          Manage, design, and download your business connection QR code
        </p>
      </div>

      <QRManager
        businessId={business._id.toString()}
        qrCode={serializedQr}
        businessSlug={business.businessSlug}
      />
    </div>
  );
}
