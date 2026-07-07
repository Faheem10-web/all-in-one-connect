"use client";

import React, { useState } from "react";
import Sidebar from "../shared/sidebar";
import Header from "../shared/header";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Palette,
  Share2,
  Image as ImageIcon,
  QrCode,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";

const mobileItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: Building2 },
  { href: "/dashboard/branding", label: "Branding", icon: Palette },
  { href: "/dashboard/social", label: "Social", icon: Share2 },
  { href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
      {/* Desktop Sidebar Layout */}
      <Sidebar />

      {/* Mobile Sidebar overlay Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/60 z-30 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "md:hidden fixed top-0 bottom-0 left-0 w-64 bg-card border-r border-border z-40 transition-transform duration-300 transform",
          mobileOpen ? "translate-x-0" : "-translate-x-0 -left-64",
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <span className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="2" y="2" width="20" height="20" rx="4" />
              <path d="M12 7v10M7 12h10" />
            </svg>
            CONNECT
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md hover:bg-secondary cursor-pointer"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {mobileItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Workspace Layout */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Header onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-slate-950">{children}</main>

        {/* Mobile Bottom Navigation (iPhone touch target rules) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-4 pb-safe-bottom z-20 shadow-lg">
          {mobileItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] font-semibold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
export default DashboardShell;
