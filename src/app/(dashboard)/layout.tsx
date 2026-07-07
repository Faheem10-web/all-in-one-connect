import { DashboardShell } from "@/components/layouts/dashboard-shell";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
