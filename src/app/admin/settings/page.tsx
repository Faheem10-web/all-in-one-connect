import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import React from "react";

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          System Configurations
        </h1>
        <p className="text-sm text-muted-foreground">
          Adjust default profiles settings, maintenance modes, and security check toggles
        </p>
      </div>

      <AdminSettingsForm />
    </div>
  );
}
