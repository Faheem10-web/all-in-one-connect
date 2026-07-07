import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings-form";
import React from "react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage password resets, email updates, and security credentials
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
