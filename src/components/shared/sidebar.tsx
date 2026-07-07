"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Palette,
  Share2,
  Image as ImageIcon,
  QrCode,
  BarChart3,
  Bell,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";

const menuItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Business Info", icon: Building2 },
  { href: "/dashboard/branding", label: "Branding", icon: Palette },
  { href: "/dashboard/social", label: "Social Links", icon: Share2 },
  { href: "/dashboard/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/logs", label: "Activity Logs", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-card border-r border-border h-screen sticky top-0 transition-all duration-300 z-20",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Brand Header Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        {!collapsed && (
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
        )}
        {collapsed && (
          <svg
            className="w-5 h-5 text-blue-500 mx-auto"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <rect x="2" y="2" width="20" height="20" rx="4" />
            <path d="M12 7v10M7 12h10" />
          </svg>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-all duration-150 relative group",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}

              {/* Tooltip on collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 rounded-md bg-slate-900 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-md">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
export default Sidebar;
