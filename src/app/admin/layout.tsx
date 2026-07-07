import { auth } from "@/auth";
import { ForbiddenView } from "@/components/shared/forbidden";
import { AdminShell } from "@/components/layouts/admin-shell";
import React from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // If user lacks admin permissions, block access and render Forbidden (403) view
  if (!session || !session.user || session.user.role !== "SUPER_ADMIN") {
    return <ForbiddenView />;
  }

  return <AdminShell>{children}</AdminShell>;
}
