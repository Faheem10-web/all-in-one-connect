"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Menu, Bell, Search, ShieldAlert, Laptop, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  // Generate breadcrumb layout links
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, label };
  });

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left side: Hamburger (Mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb resolver navigation */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Connect
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <span>/</span>
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-semibold">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right side: Actions Menu & Dropdowns */}
      <div className="flex items-center gap-4">
        {/* Mock Search trigger */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dashboard... ⌘K"
            className="h-9 w-60 pl-9 pr-4 rounded-md border border-border bg-secondary/50 text-xs outline-none focus:border-ring focus:bg-background transition-all duration-150"
            disabled
          />
        </div>

        {/* Alert Notifications Trigger */}
        <Link
          href="/dashboard/notifications"
          className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </Link>

        {/* Dynamic User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-secondary transition-all duration-150 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-border flex items-center justify-center text-xs font-extrabold text-white uppercase select-none">
              {session?.user?.email?.charAt(0) || "U"}
            </div>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <>
                {/* Backdrop overlay trigger clickaway */}
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
                    <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase mt-0.5">
                      {session?.user?.role}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 h-9 px-3 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Manage Profile
                  </Link>

                  {session?.user?.role === "SUPER_ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 h-9 px-3 rounded-md text-xs font-medium text-blue-500 hover:bg-blue-500/5 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Super Admin Panel
                    </Link>
                  )}

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
  );
}
export default Header;
