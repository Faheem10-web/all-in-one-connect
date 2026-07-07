"use client";

import React from "react";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function ForbiddenView() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm space-y-6">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto border border-destructive/20">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">403: Access Forbidden</h1>
          <p className="text-sm text-muted-foreground">
            You do not possess the administrative credentials required to view this directory
            resource.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-border bg-transparent text-foreground font-semibold text-sm hover:bg-secondary active:scale-98 transition-all duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex-1 flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 active:scale-98 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
export default ForbiddenView;
