import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/lib/models/business";
import { BusinessesManager } from "@/components/admin/businesses-manager";
import React from "react";

export default async function AdminBusinessesPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  await connectToDatabase();

  // Fetch all businesses sorted by creation date (including soft deleted is handled in models hook but admin route skips soft delete isDeleted constraint)
  const list = await Business.find({}).sort({ createdAt: -1 });

  // Serialize properties
  const serialized = list.map((b) => ({
    _id: b._id.toString(),
    name: b.name,
    category: b.category,
    businessSlug: b.businessSlug,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Business Directory Queue
        </h1>
        <p className="text-sm text-muted-foreground">
          Approve new digital profile creations, suspend accounts, and reset audit parameters
        </p>
      </div>

      <BusinessesManager businesses={serialized} />
    </div>
  );
}
