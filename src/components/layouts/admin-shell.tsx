"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ShieldAlert,
  Users,
  Building2,
  Settings,
  FileBarChart2,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";

interface AdminShellProps {
  children: React.ReactNode;
}

const adminMenu = [
  { href: "/admin", label: "Overview", icon: TrendingUp },
  { href: "/admin/users", label: "Users List", icon: Users },
  { href: "/admin/businesses", label: "Businesses Queue", icon: Building2 },
  { href: "/admin/reports", label: "Reports & Export", icon: FileBarChart2 },
  { href: "/admin/settings", label: "System Settings", icon: Settings },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
      {/* Desktop Admin Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-white h-screen sticky top-0 transition-all duration-300 z-20 shrink-0",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              ADMIN CONSOLE
            </span>
          )}
          {collapsed && <ShieldAlert className="w-5 h-5 text-blue-400 mx-auto" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {adminMenu.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-all duration-150 relative group",
                  isActive
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}

                {collapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 rounded-md bg-slate-950 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-md">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/60 z-30 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "md:hidden fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 text-white z-40 transition-transform duration-300 transform",
          mobileOpen ? "translate-x-0" : "-translate-x-0 -left-64",
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <span className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
            ADMIN CONSOLE
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {adminMenu.map((item) => {
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
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Workspace layout */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Header Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-muted-foreground select-none uppercase tracking-widest hidden sm:block">
              Administrative Control Directory
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* User details display dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-secondary transition-all duration-150 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 border border-border flex items-center justify-center text-xs font-extrabold text-white uppercase select-none">
                  {session?.user?.email?.charAt(0) || "A"}
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div onClick={() => setProfileOpen(false)} className="fixed inset-0 z-30" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card text-card-foreground shadow-md z-40 p-1.5 space-y-1"
                    >
                      <div className="px-3 py-2 text-left border-b border-border mb-1">
                        <p className="text-xs font-semibold truncate text-foreground">
                          {session?.user?.email}
                        </p>
                        <p className="text-[10px] text-blue-500 font-bold tracking-wider uppercase mt-0.5">
                          SYSTEM SUPER ADMIN
                        </p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 h-9 px-3 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        Owner Dashboard
                      </Link>

                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="w-full flex items-center gap-2.5 h-9 px-3 rounded-md text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
export default AdminShell;
